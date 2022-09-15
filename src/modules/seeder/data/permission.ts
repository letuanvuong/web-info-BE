// import { AppPermission, SM3Permission, ClinicPermission } from 'src/constant'
// import { EnumModule } from 'src/schema'

// export const appPermissions: {
//   _id: AppPermission
//   name: string
// }[] = [
//   {
//     _id: 'APP_SETTING_UPDATE',
//     name: 'Quản lý setting'
//   },
//   {
//     _id: 'APP_REPORT_VIEW',
//     name: 'Xem report'
//   },
//   {
//     _id: 'APP_PROFILE_VIEW',
//     name: 'Xem menu profile'
//   },
//   {
//     _id: 'APP_RECORDING_VIEW',
//     name: 'Xem menu recording'
//   },
//   {
//     _id: 'APP_GROUP_VIEW',
//     name: 'Xem menu group'
//   },
//   {
//     _id: 'APP_ROLE_DELETE',
//     name: 'Xóa Role'
//   },
//   {
//     _id: 'APP_ROLE_EDIT',
//     name: 'Cập nhật role (tên + phân quyền)'
//   },
//   {
//     _id: 'APP_ROLE_VIEW',
//     name: 'Xem danh sách role'
//   },
//   {
//     _id: 'APP_ROLE_CREATE',
//     name: 'Tạo role'
//   },
//   {
//     _id: 'APP_USER_CREATE',
//     name: 'Tạo user trong app'
//   },
//   {
//     _id: 'APP_USER_UPDATE_ROLE',
//     name: 'Thay đổi Role user'
//   },
//   {
//     _id: 'APP_USER_DELETE',
//     name: 'Xóa user'
//   },
//   {
//     _id: 'APP_USER_EDIT',
//     name: 'Sửa thông tin user'
//   },
//   {
//     _id: 'APP_USER_VIEW',
//     name: 'Xem danh sách thông tin user'
//   },
//   {
//     _id: 'APP_USER_INVITE_ROLE',
//     name: 'Mời đăng ký với role là mod hoặc student'
//   }
// ]

// export const clinicPermissions: {
//   _id: ClinicPermission
//   name: string
//   module: EnumModule
// }[] = [
//   {
//     _id: 'CLINIC_REPORT_VIEW_ALL_PAYMENT_RECEIPT',
//     name: 'Xem tất cả phiếu thu',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_EXAMINATION_VIEW',
//     name: 'Xem danh sách phiếu khám',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_VIEW',
//     name: 'Xem danh sách',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_SUPPLY_DRUG_CANCEL',
//     name: 'Hủy cấp thuốc',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_ASSIGN_SUBCLINICAL_VIEW',
//     name: 'Xem danh sách chỉ định cận lâm sàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_REPORT_VIEW_RECEIPT_LIST',
//     name: 'Xem bảng kê biên lai',
//     module: EnumModule.CLINIC
//   },
//   { _id: 'CLINIC_REPORT_VIEW', name: 'Xem báo cáo', module: EnumModule.CLINIC },
//   {
//     _id: 'CLINIC_DEPOSIT_REQUEST_LIST_VIEW',
//     name: 'Xem danh sách yêu cầu nộp tiền',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_DAILY_COLLECTION_REPORT_VIEW',
//     name: 'Xem báo cáo thu tiền hằng ngày',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_DIRECTORY_EDIT',
//     name: 'Chỉnh sửa danh mục',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_CANCEL',
//     name: 'Hủy phiếu CĐHA',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_APPROVE',
//     name: 'Trả kết quả xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_CREATE',
//     name: 'Tạo biên bản xuất kho',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_VIEWDOCUMENT',
//     name: 'Xem danh sách phiếu nhập',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_EXAMINATION_CANCEL',
//     name: 'Hủy phiếu khám',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_CHECK_UP',
//     name: 'Thực hiện CĐHA',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_UPDATEAPPROVEDDOCUMENT',
//     name: 'Chỉnh sửa phiếu nhập đã duyệt',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_EXAMINATION_APPROVE',
//     name: 'Kết thúc phiếu khám',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_UPDATE',
//     name: 'Chỉnh sửa kiểu hàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_CREATE',
//     name: 'Thêm kiểu hàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_CREATE',
//     name: 'Thêm mới phiếu xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_APPROVE',
//     name: 'Trả kết quả CĐHA',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_CANCELAPPROVEDDOCUMENT',
//     name: 'Hủy phiếu nhập đã duyệt',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_CANCELEXPORT',
//     name: 'Hủy xuất kho',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_DIRECTORY_VIEW',
//     name: 'Xem danh mục',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_EXAMINATION_CHECK_UP',
//     name: 'Thực hiện khám bệnh',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_CANCELDOCUMENT',
//     name: 'Hủy biên bản',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_ADDSTOCK',
//     name: 'Thêm hàng hóa',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_IMPORTVERIFIED',
//     name: 'Duyệt nhập kho',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_REMOVE',
//     name: 'Xoá kiểu hàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_CASH_DESK_CREATE',
//     name: 'Tạo phiếu thu',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_DIRECTORY_CREATE',
//     name: 'Thêm mới danh mục',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_VIEWHISTORY',
//     name: 'Xem lịch sử nhập xuất',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_DIRECTORY_DELETE',
//     name: 'Xóa danh mục',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_CASH_DESK_EDIT',
//     name: 'Chỉnh sửa thông tin phiếu thu',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_UPDATESTOCKMODEL',
//     name: 'Chỉnh sửa thông tin hàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_CANCEL',
//     name: 'Hủy phiếu xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_VIEW',
//     name: 'Xem danh sách phiếu CĐHA',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_CREATEDOCUMENT',
//     name: 'Thêm phiếu nhập',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_SUPPLY_DRUG_APPROVE',
//     name: 'Cấp phát thuốc',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_EDIT',
//     name: 'Chỉnh sửa thông tin phiếu xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_VIEWCOSTBYSTORE',
//     name: 'Xem giá vốn',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_CHOOSE_TEST',
//     name: 'Chỉ định cận lâm sàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_CASH_DESK_VIEW',
//     name: 'Xem danh sách',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_EDIT',
//     name: 'Chỉnh sửa thông tin phiếu CĐHA',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_IMAGE_ANALYSATION_CREATE',
//     name: 'Tạo phiếu CĐHA',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_RECEIVE_CANCEL',
//     name: '\tHủy phiếu tiếp nhận',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_RECEIVE_EDIT',
//     name: 'Chỉnh sửa thông tin phiếu tiếp nhận',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa phiếu nhập',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_DELETESTOCK',
//     name: 'Xóa hàng hóa',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_VIEW',
//     name: 'Xem danh sách kiểu hàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_CHECK_UP',
//     name: 'Thực hiện xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_CANCELDOCUMENT',
//     name: 'Hủy phiếu nhập',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_CHOOSE_TEST',
//     name: 'Chỉ định xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_MEDICAL_TEST_VIEW',
//     name: 'Xem danh sách phiếu xét nghiệm',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_CASH_DESK_REFUND',
//     name: 'Hoàn trả tiền',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOCKMODEL_EDITSALEPRICE',
//     name: 'Chỉnh sửa giá bán',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_ADDSTOCK',
//     name: 'Thêm hàng',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_RECEIVE_CREATE',
//     name: 'Tạo phiếu tiếp nhận',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_RECEIVE_VIEW',
//     name: 'Xem danh sách tiếp nhận',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREEXPORT_EXPORTVERIFIED',
//     name: 'Duyệt xuất kho',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_STOREIMPORT_APPROVEDOCUMENT',
//     name: 'Duyệt phiếu nhập',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_SUPPLY_DRUG_VIEW',
//     name: 'Xem danh sách cấp thuốc',
//     module: EnumModule.CLINIC
//   },
//   {
//     _id: 'CLINIC_ADMIN',
//     name: 'Quyền Administrator',
//     module: EnumModule.CLINIC
//   }
// ]

// export const sm3Permissions: {
//   _id: SM3Permission
//   name: string
//   module: EnumModule
// }[] = [
//   {
//     _id: 'WHOLESALE_VIEWDOCUMENT',
//     name: 'Xem danh sách đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_UPDATEAPPROVEDDOCUMENT',
//     name: 'Chỉnh sửa đơn hàng đã duyệt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_PRINTREDBILL',
//     name: 'In hóa đơn đỏ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_DISCOUNT',
//     name: 'Giảm giá',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_CREATEDOCUMENT',
//     name: 'Thêm đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_CHANGESURCHARGE',
//     name: 'Chỉnh sửa thuế giá trị gia tăng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_CHANGEPRICE',
//     name: 'Thay đổi giá bán',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_CANCELDOCUMENT',
//     name: 'Hủy đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_CANCELAPPROVEDDOCUMENT',
//     name: 'Hủy đơn hàng đã duyệt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_APPROVEDOCUMENT',
//     name: 'Duyệt đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'WHOLESALE_ADDSTOCK',
//     name: 'Thêm thuốc',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'VENDOR_VIEW',
//     name: 'Xem danh sách nhà cung cấp',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'VENDOR_UPDATE',
//     name: 'Chỉnh sửa thông tin nhà cung cấp',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'VENDOR_REMOVE',
//     name: 'Xóa nhà cung cấp',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'VENDOR_CREATE',
//     name: 'Tạo nhà cung cấp mới',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWSTOCKNOBILL',
//     name: 'Xem hàng không hóa đơn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWSALEHISTORY',
//     name: 'Xem lịch sử bán hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWISNOSTOCK',
//     name: 'Xem hàng ẩn tồn kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWINVENTORYSTOCK',
//     name: 'Xem tồn kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWINVENTORYALLSTORE',
//     name: 'Xem tồn kho trên tất cả các kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWIMPORTHISTORY',
//     name: 'Xem lịch sử nhập hàng của kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWEXPORTHISTORY',
//     name: 'Xem lịch sử xuất kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREMANAGER_VIEWCOSTINVENTORYSTOCK',
//     name: 'Xem giá trị tồn kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_VIEWDOCUMENT',
//     name: 'Xem danh sách phiếu nhập',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_UPDATESTOCKMODEL',
//     name: 'Chỉnh sửa thông tin hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa phiếu nhập',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_UPDATEAPPROVEDDOCUMENT',
//     name: 'Chỉnh sửa phiếu nhập đã duyệt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_CREATEDOCUMENT',
//     name: 'Thêm phiếu nhập',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_CANCELDOCUMENT',
//     name: 'Hủy phiếu nhập',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_CANCELAPPROVEDDOCUMENT',
//     name: 'Hủy phiếu nhập đã duyệt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_APPROVEDOCUMENT',
//     name: 'Duyệt phiếu nhập',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREIMPORT_ADDSTOCK',
//     name: 'Thêm hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_VIEW',
//     name: 'Xem danh sách',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa phiếu xuất',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_IMPORTVERIFIED',
//     name: 'Duyệt nhập kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_EXPORTVERIFIED',
//     name: 'Duyệt xuất kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_DELETESTOCK',
//     name: 'Xóa hàng hóa',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_CREATE',
//     name: 'Tạo biên bản xuất kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_CANCELEXPORT',
//     name: 'Hủy xuất kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_CANCELDOCUMENT',
//     name: 'Hủy biên bản',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOREEXPORT_ADDSTOCK',
//     name: 'Thêm hàng hóa',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKWARNING_ORDER',
//     name: 'Tạo yêu cầu đặt hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKWARNING_EDIT',
//     name: 'Sửa định biên',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKWARNING_CREATEEXPORTDOCUMENT',
//     name: 'Tạo biên bản xuất kho',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_VIEWHISTORY',
//     name: 'Xem lịch sử nhập xuất',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_VIEWCOSTBYSTORE',
//     name: 'Xem giá vốn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_VIEW',
//     name: 'Xem danh sách kiểu hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_UPDATE',
//     name: 'Chỉnh sửa kiểu hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_REMOVE',
//     name: 'Xoá kiểu hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_EDITSALEPRICE',
//     name: 'Chỉnh sửa giá bán',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODEL_CREATE',
//     name: 'Thêm kiểu hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDER_VIEW',
//     name: 'Khai báo hàng thiếu xem',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDER_CREATE',
//     name: 'Khai báo hàng thiếu tạo',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDERREPORT_VIEWDETAIL',
//     name: 'Yêu cầu đặt hàng xem chi tiết',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDERREPORT_VIEW',
//     name: 'Yêu cầu đặt hàng xem',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDERREPORT_VERIFY',
//     name: 'Yêu cầu đặt hàng duyệt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDERREPORT_PRINT',
//     name: 'Yêu cầu đặt hàng in',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDERREPORT_EXPORTEXCEL',
//     name: 'Yêu cầu đặt hàng xuất file',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKMODELORDERREPORT_DELETE',
//     name: 'Yêu cầu đặt hàng xóa',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_VIEWDOCUMENT',
//     name: 'Xem biên bản',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_UPDATEDOCUMENT',
//     name: 'Sửa biên bản',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_CREATEDOCUMENT',
//     name: 'Tạo biên bản',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_CHECKINVENTORY',
//     name: 'Kiểm kê thuốc',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_CANCELDOCUMENT',
//     name: 'Hủy biên bản',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_CANCELAPPROVESTOCK',
//     name: 'Hủy duyệt thuốc',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_APPROVESTOCK',
//     name: 'Duyệt thuốc',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_APPROVEDOCUMENT',
//     name: 'Duyệt biên bản',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'STOCKCONTROL_ADDSTOCK',
//     name: 'Thêm thuốc nhanh',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'SETTING_UPDATEMUNE',
//     name: 'chỉnh sửa bố cục menu',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'SETTING_UPDATE',
//     name: 'chỉnh sửa cài đặt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'SETTING_ADVANCE',
//     name: 'Cài đặt nâng cao',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_DOCUMENTVIEWDOCUMENT',
//     name: 'Xem danh sách trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_DOCUMENTVIEWDETAIL',
//     name: 'Xem chi tiết biên bản trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_DOCUMENTVERIFYDOCUMENT',
//     name: 'Duyệt biên bản trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_DOCUMENTREMOVEDOCUMENT',
//     name: 'Hủy biên bản trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_DOCUMENTCREATEDOCUMENT',
//     name: 'Tạo biên bản trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_DOCUMENTADDSTOCK',
//     name: 'Trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_CREATE',
//     name: 'Thêm phiếu trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_CHANGEPENATY',
//     name: 'Thay đổi tỉ lệ phạt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETURNRETAIL_APPROVE',
//     name: 'Duyệt phiếu trả hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_VIEWDOCUMENT',
//     name: 'Xem đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_PAYMENT',
//     name: 'Thanh toán',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_NOLIMMITEDDISCOUNT',
//     name: 'Không giới hạn giảm giá',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_DISCOUNT',
//     name: 'Giảm giá',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_DEBIT',
//     name: 'Ghi nợ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_CREATEDOCUMENT',
//     name: 'Tạo đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_CHANGESURCHARE',
//     name: 'Chỉnh sửa thuế giá trị gia tăng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_CHANGEPRICE',
//     name: 'Thay đổi giá bán',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_CANCELDOCUMENT',
//     name: 'Hủy đơn hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAIL_ADDSTOCK',
//     name: 'Thêm thuốc',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAILDOCUMENT_VIEWTOTAL',
//     name: 'Xem tổng tiền',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAILDOCUMENT_VIEWPROFIT',
//     name: 'Xem nhật lợi nhuật',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'RETAILDOCUMENT_VIEWDOCUMENT',
//     name: 'Xem nhật ký bán hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'REPORT_VIEW',
//     name: 'Xem báo cáo',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_VIEWDOCUMENT',
//     name: 'Xem danh sách phiếu đặt hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_UPDATESTOCKMODEL',
//     name: 'Chỉnh sửa thông tin hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa phiếu đặt hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_CREATEDOCUMENT',
//     name: 'Thêm phiếu đặt hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_CANCELDOCUMENT',
//     name: 'Hủy phiếu đặt hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_APPROVEDOCUMENT',
//     name: 'Duyệt phiếu đặt hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PURCHASEORDER_ADDSTOCK',
//     name: 'Thêm hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PAYSLIP_VIEWTHEIROWNPAYSLIPS',
//     name: 'Xem bảng lương cá nhân',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PAYSLIP_VIEWALLPAYSLIPS',
//     name: 'Xem toàn bộ bảng lương',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PAYSLIP_UPDATEPAYSLIP',
//     name: 'Chỉnh sửa bảng lương',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PAYDEBT_VIEWDEBT',
//     name: 'Xem công nợ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PAYDEBT_DEBTSETTLEMENT',
//     name: 'Thanh toán công nợ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PATIENT_VIEW',
//     name: 'Xem danh sách bệnh nhân',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PATIENT_UPDATE',
//     name: 'Chỉnh sửa bệnh nhân',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PATIENT_REMOVE',
//     name: 'Xóa bệnh nhân',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'PATIENT_CREATE',
//     name: 'Thêm bệnh nhân',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXPORT_NOTEXCEL',
//     name: 'Không thể xuất file',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXPORT_ACCOUNTING',
//     name: 'Xuất file excel kế toán',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_VIEWDOCUMENT',
//     name: 'Xem danh sách phiên khám',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa phiên khám',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_PRINTRESULT',
//     name: 'In kết quả khám bệnh',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_PRINTPRESCRIPTION',
//     name: 'In đơn thuốc',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_CREATEDDOCUMENT',
//     name: 'Thêm phiên khám',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_CANCELDOCUMENT',
//     name: 'Hủy phiên khám',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'EXAMINATIONSESSION_APPROVEDOCUMENT',
//     name: 'Kết thúc phiên khám',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DOCTOR_VIEW',
//     name: 'Xem danh sách bác sĩ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DOCTOR_UPDATE',
//     name: 'Chỉnh sửa thông tin bác sĩ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DOCTOR_REMOVE',
//     name: 'Xóa bác sĩ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DOCTOR_CREATE',
//     name: 'Thêm bác sĩ',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DIRECTORY_VIEW',
//     name: 'Xem danh mục',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DIRECTORY_EDIT',
//     name: 'Chỉnh sửa danh mục',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DIRECTORY_DELETE',
//     name: 'Xóa danh mục',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'DIRECTORY_CREATE',
//     name: 'Thêm mới danh mục',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CUSTOMER_VIEW',
//     name: 'Xem danh sách khách hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CUSTOMER_UPDATE',
//     name: 'Chỉnh sửa khách hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CUSTOMER_REMOVE',
//     name: 'Xóa khách hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CUSTOMER_CREATE',
//     name: 'Tạo khách hàng',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CONNECTNATIONAL_VIEWDOCUMENT',
//     name: 'Xem danh sách liên thông',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CONNECTNATIONAL_UPDATEINFO',
//     name: 'Chỉnh sửa thông tin',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CONNECTNATIONAL_CREATEVITURALBILL',
//     name: 'Thêm hóa đơn ảo',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CONNECTNATIONAL_CANCEL',
//     name: 'Hủy liên thông',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CONNECTNATIONAL_APPROVE',
//     name: 'Thực hiện liên thông',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CASHMANAGEMENT_VIEWCASH',
//     name: 'Xem tiền mặt',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CASHMANAGEMENT_CREATERECEIPTS',
//     name: 'Tạo phiếu thu',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CASHMANAGEMENT_CREATEPAYMENTSLIP',
//     name: 'Tạo phiếu chi',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'CASHMANAGEMENT_ADDFIRSTDAYCASH',
//     name: 'Thêm tiền mặt đầu ngày',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_VIEWDOCUMENT',
//     name: 'Xem danh sách lịch hẹn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_VIEWALLDOCUMENT',
//     name: 'Xem tất cả lịch hẹn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_UPDATEDOCUMENT',
//     name: 'Chỉnh sửa lịch hẹn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_PRINTDOCUMENT',
//     name: 'In lịch hẹn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_CREATEDDOCUMENT',
//     name: 'Thêm lịch hẹn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_CANCELDOCUMENT',
//     name: 'Hủy lịch hẹn',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'APPOINTMENT_APPROVEDOCUMENT',
//     name: 'Tiếp nhận bệnh nhân',
//     module: EnumModule.SM3
//   },
//   {
//     _id: 'ADMIN',
//     name: 'Quyền Administrator',
//     module: EnumModule.SM3
//   }
// ]

// // export all permissions need to seed
// export const dataPermission = [...sm3Permissions]
