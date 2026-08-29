export interface TransferRecord {
  id: string;
  userId: string;
  userName: string;
  previousHqId: string;
  newHqId: string;
  previousDivisionId?: string;
  newDivisionId?: string;
  reason?: string;
  effectiveDate: string;
  createdAt: string;
}

export interface ITransferGateway {
  transferUser(
    userId: string,
    hqId: string,
    divisionId?: string,
    primaryAreaId?: string,
    reason?: string,
    effectiveDate?: string
  ): Promise<TransferRecord>;
  getTransferHistory(): Promise<TransferRecord[]>;
}
