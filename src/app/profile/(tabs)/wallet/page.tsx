"use client";

import { TokenCard } from '@/components/TokenCard';
import { fetchSds, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { getCredentials } from '@/libs/utils/user';
import { Button, DropdownItem, DropdownMenu, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';


export type SteemTokens = 'steem' | 'steem_power' | 'steem_dollar' | 'saving';


const tokens = {
  steem: {
    symbol: 'STEEM',
    title: 'STEEM',
    description: `Tradeable tokens that may be transferred anywhere at anytime.
        Steem can be converted to STEEM POWER in a process called powering up.`
  },
  steem_power: {
    symbol: undefined,
    title: 'STEEM POWER',
    description: `Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.
        Part of faisalamin's STEEM POWER is currently delegated. Delegation is donated for influence or to help new users perform actions on Steemit. Your delegation amount can fluctuate.
        STEEM POWER increases at an APR of approximately 2.77%, subject to blockchain variance. See FAQ for details.`
  },
  steem_dollar: {
    symbol: undefined,
    title: "STEEM DOLLARS",
    description: `Tradeable tokens that may be transferred anywhere at anytime.`
  },
  saving: {
    symbol: undefined,
    title: "SAVINGS",
    description: `Balances subject to 3 day withdraw waiting period.`
  }
}

const steem_power_desc = (username: string) => `Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.
Part of ${username}'s STEEM POWER is currently delegated. Delegation is donated for influence or to help new users perform actions on Steemit. Your delegation amount can fluctuate.
STEEM POWER increases at an APR of approximately 2.77%, subject to blockchain variance. See FAQ for details.`;

export default function ProfileWalletTab() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  let { username, category } = usePathnameClient();
  const { data: session } = useSession();
  const loginInfo = useAppSelector(state => state.loginReducer.value);
  const isSelf = loginInfo.name === username;

  let [key, setKey] = useState<SteemTokens>();
  function handleInfo(tokenKey: SteemTokens) {
    key = tokenKey;
    setKey(tokenKey);
    onOpen();
  }

  const dispatch = useAppDispatch();

  const URL = `/accounts_api/getAccountExt/${username}/${session?.user?.name || 'null'}`
  let { data } = useSWR(!isSelf ? URL : undefined, fetchSds<AccountExt>);
  console.log(1122, data)


  if (!isSelf && data) {
    dispatch(addProfileHandler(data));
  }

  if (isSelf) data = loginInfo;


  return (
    <div className='flex flex-col gap-4'>
      {data && <>
        <TokenCard tokenKey='steem' symbol={tokens.steem.symbol}
          description={tokens.steem.description}
          title={tokens.steem.title}
          endContent={<div className='flex gap-2'>
            <p>{data.balance_steem}</p>
          </div>}

          actionContent={<DropdownMenu>
            <DropdownItem key="new">Transfer</DropdownItem>
            <DropdownItem key="copy">Transfer to Savings</DropdownItem>
            <DropdownItem key="copy">Power Up</DropdownItem>
          </DropdownMenu>

          }
          handleInfoClick={handleInfo}
        />

        <TokenCard tokenKey='steem_power' symbol={tokens.steem_power.symbol}
          description={steem_power_desc('')}
          title={tokens.steem_power.title}

          endContent={<div>
            <p>{data.vests_own}</p>
          </div>}

          actionContent={<DropdownMenu>
            <DropdownItem key="new">Delegate</DropdownItem>
            <DropdownItem key="copy">Power Down</DropdownItem>
          </DropdownMenu>
          }
          handleInfoClick={handleInfo}

        />


        <TokenCard tokenKey='steem_dollar'
          description={tokens.steem_dollar.description}
          title={tokens.steem_dollar.title}

          endContent={<div>
            <p>${data.balance_sbd}</p>
          </div>}

          actionContent={<DropdownMenu>
            <DropdownItem key="new">Transfer</DropdownItem>
            <DropdownItem key="copy">Transfer to Savings</DropdownItem>
          </DropdownMenu>
          }
          handleInfoClick={handleInfo}

        />

        <TokenCard
          tokenKey={'saving'}
          description={tokens.saving.description}
          title={tokens.saving.title}
          endContent={<div className='flex flex-col items-end max-md:items-center'>
            <p>${data.savings_steem} STEEM</p>
            <p>${data.savings_sbd}</p>
          </div>}
          handleInfoClick={handleInfo}

        />

      </>

      }

      {isOpen && <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            key &&
            <>
              <ModalHeader className="flex flex-col gap-1">{tokens[key]['title']}</ModalHeader>
              <ModalBody>
                <p>
                  {tokens[key]['description']}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                {/* <Button color="primary" onPress={onClose}>
                                    Action
                                </Button> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>}
    </div>

  )
}
