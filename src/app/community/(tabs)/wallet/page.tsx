"use client";

import { Button, DropdownItem, DropdownMenu, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { useMemo, useState } from 'react';
import { TokenCard } from '../../../../components/TokenCard';


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



export default function CommunityWalletPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  let [key, setKey] = useState<SteemTokens>();
  function handleInfo(tokenKey: SteemTokens) {
    key = tokenKey;
    setKey(tokenKey);
    onOpen();
  }

  return (
    <div className='flex flex-col gap-4'>
      {useMemo(() => {
        return <>
          <TokenCard tokenKey='steem' symbol={tokens.steem.symbol}
            description={tokens.steem.description}
            title={tokens.steem.title}
            endContent={<div className='flex gap-2'>
              <p>0.001</p>
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
            description={tokens.steem_power.description}
            title={tokens.steem_power.title}

            endContent={<div>
              <p>40,796.479</p>
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
              <p>$0.000</p>
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
              <p>0.100 STEEM</p>
              <p>$0.000</p>
            </div>}
            handleInfoClick={handleInfo}

          />

        </>

      }, [])}

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
