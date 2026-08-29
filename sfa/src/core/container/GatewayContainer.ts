import type { IAuthGateway } from '../contracts/IAuthGateway';
import type { IEmployeeGateway } from '../contracts/IEmployeeGateway';
import type { IUserGateway } from '../contracts/IUserGateway';
import type { IGeographyGateway } from '../contracts/IGeographyGateway';
import type { IHeadOfficeGateway } from '../contracts/IHeadOfficeGateway';
import type { IDocumentGateway } from '../contracts/IDocumentGateway';
import type { ISystemSettingsGateway } from '../contracts/ISystemSettingsGateway';
import type { ISfcGateway } from '../contracts/ISfcGateway';
import type { IDaGateway } from '../contracts/IDaGateway';
import type { ILeaveGateway } from '../contracts/ILeaveGateway';
import type { ITransferGateway } from '../contracts/ITransferGateway';
import type { IPromotionGateway } from '../contracts/IPromotionGateway';
import type { IApprovalGateway } from '../contracts/IApprovalGateway';
import type { IFieldMasterGateway } from '../contracts/IFieldMasterGateway';
import type { ILocationGateway } from '../contracts/ILocationGateway';

import { CloudflareAuthGateway } from '../../infrastructure/providers/cloudflare/CloudflareAuthGateway';
import { CloudflareEmployeeGateway } from '../../infrastructure/providers/cloudflare/CloudflareEmployeeGateway';
import { CloudflareUserGateway } from '../../infrastructure/providers/cloudflare/CloudflareUserGateway';
import { CloudflareGeographyGateway } from '../../infrastructure/providers/cloudflare/CloudflareGeographyGateway';
import { CloudflareHeadOfficeGateway } from '../../infrastructure/providers/cloudflare/CloudflareHeadOfficeGateway';
import { CloudflareDocumentGateway } from '../../infrastructure/providers/cloudflare/CloudflareDocumentGateway';
import { CloudflareSystemSettingsGateway } from '../../infrastructure/providers/cloudflare/CloudflareSystemSettingsGateway';
import { CloudflareSfcGateway } from '../../infrastructure/providers/cloudflare/CloudflareSfcGateway';
import { CloudflareDaGateway } from '../../infrastructure/providers/cloudflare/CloudflareDaGateway';
import { CloudflareLeaveGateway } from '../../infrastructure/providers/cloudflare/CloudflareLeaveGateway';
import { CloudflareTransferGateway } from '../../infrastructure/providers/cloudflare/CloudflareTransferGateway';
import { CloudflarePromotionGateway } from '../../infrastructure/providers/cloudflare/CloudflarePromotionGateway';
import { CloudflareApprovalGateway } from '../../infrastructure/providers/cloudflare/CloudflareApprovalGateway';
import { CloudflareFieldMasterGateway } from '../../infrastructure/providers/cloudflare/CloudflareFieldMasterGateway';
import { OpenStreetMapLocationGateway } from '../../infrastructure/providers/openstreetmap/OpenStreetMapLocationGateway';

export class GatewayContainer {
  private static authGateway: IAuthGateway = new CloudflareAuthGateway();
  private static employeeGateway: IEmployeeGateway = new CloudflareEmployeeGateway();
  private static userGateway: IUserGateway = new CloudflareUserGateway();
  private static geographyGateway: IGeographyGateway = new CloudflareGeographyGateway();
  private static headOfficeGateway: IHeadOfficeGateway = new CloudflareHeadOfficeGateway();
  private static documentGateway: IDocumentGateway = new CloudflareDocumentGateway();
  private static systemSettingsGateway: ISystemSettingsGateway = new CloudflareSystemSettingsGateway();
  private static sfcGateway: ISfcGateway = new CloudflareSfcGateway();
  private static daGateway: IDaGateway = new CloudflareDaGateway();
  private static leaveGateway: ILeaveGateway = new CloudflareLeaveGateway();
  private static transferGateway: ITransferGateway = new CloudflareTransferGateway();
  private static promotionGateway: IPromotionGateway = new CloudflarePromotionGateway();
  private static approvalGateway: IApprovalGateway = new CloudflareApprovalGateway();
  private static fieldMasterGateway: IFieldMasterGateway = new CloudflareFieldMasterGateway();
  private static locationGateway: ILocationGateway = new OpenStreetMapLocationGateway();

  static getAuthGateway(): IAuthGateway { return this.authGateway; }
  static getEmployeeGateway(): IEmployeeGateway { return this.employeeGateway; }
  static getUserGateway(): IUserGateway { return this.userGateway; }
  static getGeographyGateway(): IGeographyGateway { return this.geographyGateway; }
  static getHeadOfficeGateway(): IHeadOfficeGateway { return this.headOfficeGateway; }
  static getDocumentGateway(): IDocumentGateway { return this.documentGateway; }
  static getSystemSettingsGateway(): ISystemSettingsGateway { return this.systemSettingsGateway; }
  static getSfcGateway(): ISfcGateway { return this.sfcGateway; }
  static getDaGateway(): IDaGateway { return this.daGateway; }
  static getLeaveGateway(): ILeaveGateway { return this.leaveGateway; }
  static getTransferGateway(): ITransferGateway { return this.transferGateway; }
  static getPromotionGateway(): IPromotionGateway { return this.promotionGateway; }
  static getApprovalGateway(): IApprovalGateway { return this.approvalGateway; }
  static getFieldMasterGateway(): IFieldMasterGateway { return this.fieldMasterGateway; }
  static getLocationGateway(): ILocationGateway { return this.locationGateway; }
}
