import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ActivationTokenHashModule } from './modules/ActivationTokenHash/ActivationTokenHash.module'
import { AppInfoModule } from './modules/app-info/app-info.module'
import { AuthModule } from './modules/auth/auth.module'
import ConfigurationModule from './modules/base-modules/configuration/config.module'
import GQLModule from './modules/base-modules/graphql/gql.module'
import { MongooseModule } from './modules/base-modules/mongoose/mongoose.module'
import { MyContextModule } from './modules/base-modules/my-context/my-context.module'
import { EventEmitterConfig } from './modules/base-modules/my-event-emitter/my-event-emitter.config'
import { MyEventEmitterModule } from './modules/base-modules/my-event-emitter/my-event-emitter.module'
import { MyEventHandlerModule } from './modules/base-modules/my-event-handler/my-event-handler.module'
import { ServiceManagerModule } from './modules/base-modules/service-manager/service-manager.module'
import { BlogModule } from './modules/Blog/Blog.module'
import CommonModule from './modules/common/common.module'
import { ContentAboutUsModule } from './modules/ContentAboutUs/ContentAboutUs.module'
import { ContentContactModule } from './modules/ContentContact/ContentContact.module'
import { ContentFooterModule } from './modules/ContentFooter/ContentFooter.module'
import { ContentHomePageModule } from './modules/ContentHomePage/ContentHomePage.module'
import { ContentMenuModule } from './modules/ContentMenu/ContentMenu.module'
import { ContentPurchaseInfoModule } from './modules/ContentPurchaseInfo/ContentPurchaseInfo.module'
import { ContentSecurityModule } from './modules/ContentSecurity/ContentSecurity.module'
import { CustomerModule } from './modules/Customer/Customer.module'
import { DeliveryAddressModule } from './modules/DeliveryAddress/DeliveryAddress.module'
import { DM_DonViHanhChinhModule } from './modules/DM_DonViHanhChinh/DM_DonViHanhChinh.module'
import { EcomCategoriesModule } from './modules/EcomCategories/EcomCategories.module'
import { FileUploaderModule } from './modules/fileUploader/fileUploader.module'
import { HistoryVersionModule } from './modules/HistoryVersion/HistoryVersion.module'
import { MailContactModule } from './modules/MailContact/MailContact.module'
import { MapBlogRelatedModule } from './modules/MapBlogRelated/MapBlogRelated.module'
import { MapServiceProductModule } from './modules/MapServiceProduct/MapServiceProduct.module'
import { MapStockModelRelatedModule } from './modules/MapStockModelRelated/MapStockModelRelated.module'
import { NodeModule } from './modules/node/node.module'
import { OrderModule } from './modules/Order/order.module'
import { OrderDetailModule } from './modules/OrderDetail/Order.module'
import { PageModule } from './modules/Page/Page.module'
import { ReportModule } from './modules/Report/report.module'
import { SeederModule } from './modules/seeder/seeder.module'
import { ServiceModule } from './modules/Service/Service.module'
import { SettingModule } from './modules/Setting/Setting.module'
import { StaffModule } from './modules/Staff/Staff.module'
import { StockModule } from './modules/Stock/Stock.module'
import { StockModelModule } from './modules/StockModel/StockModule.module'
import { SubscriberModule } from './modules/Subscriber/Subscriber.module'
import { UniversalSearchModule } from './modules/UniversalSearch/UniversalSearch.module'
import { UserModule } from './modules/user/User.module'
import { VerifyTokenModule } from './modules/VerifyToken/VerifyToken.module'
import { WebhookModule } from './modules/webhook/webhook.module'

@Module({
  imports: [
    EventEmitterModule.forRoot(EventEmitterConfig),
    MapBlogRelatedModule,
    MapStockModelRelatedModule,
    MapServiceProductModule,
    ServiceModule,
    PageModule,
    BlogModule,
    UserModule,
    GQLModule,
    AuthModule,
    MongooseModule,
    ConfigurationModule,
    ScheduleModule.forRoot(),
    SeederModule,
    NodeModule,
    WebhookModule,
    MyContextModule,
    MyEventEmitterModule,
    MyEventHandlerModule,
    AppInfoModule,
    ServiceManagerModule,
    FileUploaderModule,
    ContentFooterModule,
    ContentContactModule,
    ContentMenuModule,
    ContentHomePageModule,
    VerifyTokenModule,
    ActivationTokenHashModule,
    CommonModule,
    EcomCategoriesModule,
    CustomerModule,
    StockModelModule,
    StaffModule,
    DM_DonViHanhChinhModule,
    DeliveryAddressModule,
    OrderModule,
    OrderDetailModule,
    ContentAboutUsModule,
    ContentPurchaseInfoModule,
    ContentSecurityModule,
    ReportModule,
    SettingModule,
    StockModule,
    SubscriberModule,
    MailContactModule,
    UniversalSearchModule,
    HistoryVersionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
