import {
  AppPermission,
  AppRole,
  //   GroupPermission,
  //   GroupRole
} from 'src/constant'

export const appRoles: {
  _id: AppRole
  type: 'APP_ROLE'
  description?: string
  permissions: AppPermission[]
}[] = [
  {
    _id: 'AR_SUPERADMIN',
    type: 'APP_ROLE',
    permissions: [
      'APP_SETTING_UPDATE',
      'APP_REPORT_VIEW',
      'APP_PROFILE_VIEW',
      'APP_RECORDING_VIEW',
      'APP_GROUP_VIEW',
      'APP_ROLE_DELETE',
      'APP_ROLE_EDIT',
      'APP_ROLE_VIEW',
      'APP_ROLE_CREATE',
      'APP_USER_CREATE',
      'APP_USER_UPDATE_ROLE',
      'APP_USER_DELETE',
      'APP_USER_EDIT',
      'APP_USER_VIEW',
      'APP_USER_INVITE_ROLE',
    ],
  },
  {
    _id: 'AR_MODERATOR',
    type: 'APP_ROLE',
    permissions: [
      'APP_GROUP_CREATE',
      'APP_USER_VIEW',
      'APP_USER_CREATE',
      'APP_REPORT_VIEW',
      'APP_MEETING_VIEW',
      'APP_MEETING_CREATE',
      'APP_PROFILE_VIEW',
      'APP_RECORDING_VIEW',
      'APP_GROUP_VIEW',
    ],
  },
  {
    _id: 'AR_ADMIN',
    type: 'APP_ROLE',
    description: 'Quyền của app admin',
    permissions: [
      'APP_GROUP_CREATE',
      'APP_USER_VIEW',
      'APP_USER_EDIT',
      'APP_USER_DELETE',
      'APP_USER_UPDATE_ROLE',
      'APP_USER_CREATE',
      'APP_ROLE_CREATE',
      'APP_ROLE_VIEW',
      'APP_ROLE_EDIT',
      'APP_ROLE_DELETE',
      'APP_REPORT_VIEW',
      'APP_MEETING_VIEW',
      'APP_MEETING_CREATE',
      'APP_PROFILE_VIEW',
      'APP_RECORDING_VIEW',
      'APP_GROUP_VIEW',
      'APP_USER_INVITE_ROLE',
    ],
  },
  {
    _id: 'AR_MEMBER',
    type: 'APP_ROLE',
    description: 'Quyền thành viên của app',
    permissions: [
      'APP_MEETING_VIEW',
      'APP_MEETING_CREATE',
      'APP_PROFILE_VIEW',
      'APP_RECORDING_VIEW',
      'APP_GROUP_VIEW',
    ],
  },
  {
    _id: 'AR_GUEST',
    type: 'APP_ROLE',
    permissions: ['APP_MEETING_VIEW'],
  },
  {
    _id: 'AR_BOT_RECORD',
    type: 'APP_ROLE',
    permissions: ['APP_MEETING_VIEW'],
  },
]

// export const groupRoles: {
//   _id: GroupRole
//   type: 'GROUP_ROLE'
//   description?: string
//   permissions: GroupPermission[]
// }[] = [
//   {
//     _id: 'GR_MEMBER',
//     type: 'GROUP_ROLE',
//     permissions: []
//   },
//   {
//     _id: 'GR_MODERATOR',
//     type: 'GROUP_ROLE',
//     permissions: ['GR_MEMBER_INVITE', 'GR_MEMBER_KICK']
//   },
//   {
//     _id: 'GR_ADMIN',
//     type: 'GROUP_ROLE',
//     permissions: [
//       'GR_GROUP_UPDATE',
//       'GR_GROUP_REMOVE',
//       'GR_MEMBER_INVITE',
//       'GR_MEMBER_UPDATE',
//       'GR_MEMBER_KICK',
//       'GR_ROLE_ASSIGN'
//     ]
//   }
// ]
