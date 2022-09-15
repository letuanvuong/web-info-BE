import { LeanDocument } from 'mongoose'
import { StaffDocument } from 'src/modules/Staff/schemas/NhanVien.schema'
import { StaffService } from 'src/modules/Staff/Staff.service'

import { ServiceManager } from '../../service-manager/service-manager'
import { MyDataLoader } from './my-data-loader'

export function createStaffByIdLoader(serviceManager: ServiceManager) {
  return new MyDataLoader<string, LeanDocument<StaffDocument>>(
    async (staffIds) => {
      const staffService = serviceManager.get(StaffService)
      let staffs = await staffService.findStaffByFilter({
        _id: { $in: [...staffIds] },
      })

      if (!staffs) staffs = []

      const staffHashById = staffs.reduce<
        Record<string, LeanDocument<StaffDocument>>
      >((output, currentStaff) => {
        if (currentStaff._id) {
          output[currentStaff._id] = currentStaff
        }
        return output
      }, {})

      // map below used for keeping data output has same order as list ids input
      return staffIds.map((eachId) => staffHashById[eachId])
    },
  )
}
