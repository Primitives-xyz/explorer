export enum BLOCKCHAIN {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
}

export interface IPaginatedResponse {
  page: number
  pageSize: number
}
