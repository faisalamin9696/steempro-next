import AccountHeader from '@/components/AccountHeader';
import UserCoverCard from '@/components/UserCoverCard';
import { useAppSelector } from '@/libs/constants/AppFunctions'
import { Input, Textarea } from '@nextui-org/react';
import React, { useState } from 'react'

export default function ProfileSettingsTab() {

  const loginInfo = useAppSelector(state => state.loginReducer.value);
  const [displayName, setDisplayName] = useState('');
  const posting_json_metadata = { profile: { name: displayName } }
  let parsed_metadata = JSON.parse(loginInfo.posting_json_metadata);
  parsed_metadata.profile.name = displayName;

  console.log(1122, parsed_metadata)

  return (
    <div className='flex flex-col gap-6'>

      <AccountHeader account={{
        ...loginInfo, json_metadata: JSON.stringify(parsed_metadata)
      }} />

      <Input label='Profile picture url' maxLength={200}


      />

      <Input label='Cover image url' maxLength={200} />

      <Input label='Display Name' maxLength={20}
        value={displayName} onValueChange={setDisplayName} />

      <Input label='Location' maxLength={30} />

      <Input label='Website' maxLength={100} />

      <Input label='About' maxLength={160}

      />



    </div>
  )
}
