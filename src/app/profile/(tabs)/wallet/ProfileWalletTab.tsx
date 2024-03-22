"use client";

import { Tab, Tabs } from '@nextui-org/tabs'
import { Button } from '@nextui-org/button';
import BalanceTab from './(tabs)/BalanceTab';
import DelegationTab from './(tabs)/DelegationTab';
import { vestToSteem } from '@/libs/steem/sds';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { useMutation } from '@tanstack/react-query';
import { claimRewardBalance } from '@/libs/steem/condenser';
import { toast } from 'sonner';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { useLogin } from '@/components/useLogin';
import { getCredentials, getSessionKey } from '@/libs/utils/user';
import TransferHistoryTab from './(tabs)/TransferHistoryTab';
import { getTimeFromNow } from '@/libs/utils/time';
import { FaArrowAltCircleDown } from 'react-icons/fa';



export default function ProfileWalletTab({ data }: { data: AccountExt }) {
  const { username } = usePathnameClient();

  const loginInfo = useAppSelector(state => state.loginReducer.value);
  const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
  const dispatch = useAppDispatch();
  const isSelf = !!loginInfo.name && (loginInfo.name === (username));
  const { authenticateUser, isAuthorized } = useLogin();

  const claimMutation = useMutation({
    mutationFn: (key: string) => claimRewardBalance(loginInfo, key, loginInfo.rewards_steem, loginInfo.rewards_sbd, loginInfo.rewards_vests),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message);
        return
      }
      dispatch(saveLoginHandler({
        ...loginInfo, rewards_sbd: 0,
        rewards_steem: 0, rewards_vests: 0,
        balance_steem: loginInfo.balance_steem + loginInfo.rewards_steem,
        balance_sbd: loginInfo.balance_sbd + loginInfo.rewards_sbd,
        vests_own: loginInfo.vests_own + loginInfo.rewards_vests

      }));
      toast.success('Reward claimed');
    },
  })

  async function handleClaimReward() {
    authenticateUser();
    if (!isAuthorized())
      return;
    const credentials = getCredentials(getSessionKey());
    if (!credentials?.key) {
      toast.error('Invalid credentials');
      return
    }

    claimMutation.mutate(credentials.key);

  }

  const getRewardsString = (account: AccountExt, globals: SteemProps): string | undefined => {
    const reward_steem =
      account.rewards_steem > 0 ? `${account.rewards_steem.toFixed(3)} STEEM` : null;
    const reward_sbd =
      account.rewards_sbd > 0 ? `${account.rewards_sbd.toFixed(3)} SBD` : null;
    const reward_sp =
      account.rewards_vests > 0 ? `${(vestToSteem(account.rewards_vests, globals.steem_per_share)).toFixed(3)} SP` : null;

    const rewards: string[] = [];
    if (reward_steem) rewards.push(reward_steem);
    if (reward_sbd) rewards.push(reward_sbd);
    if (reward_sp) rewards.push(reward_sp);

    let rewards_str: string | undefined;
    switch (rewards.length) {
      case 3:
        rewards_str = `${rewards[0]}, ${rewards[1]} and ${rewards[2]}`;
        break;
      case 2:
        rewards_str = `${rewards[0]} and ${rewards[1]}`;
        break;
      case 1:
        rewards_str = `${rewards[0]}`;
        break;
      default:
        rewards_str = undefined;
    }
    return rewards_str;
  };


  return (
    <div className=' flex flex-col gap-2'>

      {getRewardsString(data, globalData) &&
        <div className='flex flex-col gap-2 items-center mt-4'>
          <p className='text-sm text-default-800'>Unclaimed rewards ${getRewardsString(data, globalData)}</p>
          {isSelf && <Button onPress={handleClaimReward}
            isDisabled={claimMutation.isPending}
            isLoading={claimMutation.isPending}
            size='sm'>Claim Reward</Button>}
        </div>
      }

      {!!data.powerdown && <div className='flex flex-col gap-2 items-center mt-4'>
        <div className='flex gap-2 items-center'>
          <FaArrowAltCircleDown className='text-red-400 text-medium' title='Power down' />
          <p className='text-sm'>{vestToSteem(data.powerdown_done, globalData.steem_per_share)?.toLocaleString()}/{vestToSteem(data.powerdown, globalData.steem_per_share)?.toLocaleString()} STEEM</p>
        </div>
        <p className='text-tiny'>Next power down {getTimeFromNow(data.next_powerdown * 1000)}: ~{vestToSteem(data.powerdown_rate, globalData.steem_per_share)?.toLocaleString()} STEEM</p>


      </div>
      }

      <Tabs aria-label="Options" variant='underlined' size='sm'>
        <Tab key="balance" title="Balance">
          <BalanceTab data={data} />
        </Tab>

        <Tab key="delegation" title="Delegation">
          <DelegationTab data={data} />
        </Tab>

        <Tab key="history" title="History">
          <TransferHistoryTab data={data} />
        </Tab>

      </Tabs>
    </div>
  )
}
