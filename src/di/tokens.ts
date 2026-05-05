export const TOKENS = {
  // Repositories
  UserRepository: Symbol('IUserRepository'),
  ProviderRepository: Symbol('IProviderRepository'),
  ConnectionRepository: Symbol('IConnectionRepository'),
  ComboRepository: Symbol('IComboRepository'),
  UsageRepository: Symbol('IUsageRepository'),
  QuotaRepository: Symbol('IQuotaRepository'),
  ProxyPoolRepository: Symbol('IProxyPoolRepository'),

  // Services
  PasswordHasher: Symbol('IPasswordHasher'),
  JwtService: Symbol('IJwtService'),
  OidcService: Symbol('IOidcService'),
  CacheService: Symbol('ICacheService'),

  // Use Cases - Auth
  LoginUseCase: Symbol('LoginUseCase'),
  LogoutUseCase: Symbol('LogoutUseCase'),
  VerifySessionUseCase: Symbol('VerifySessionUseCase'),
  OidcCallbackUseCase: Symbol('OidcCallbackUseCase'),

  // Use Cases - Proxy
  HandleChatUseCase: Symbol('HandleChatUseCase'),
  HandleModelsUseCase: Symbol('HandleModelsUseCase'),
  ResolveComboUseCase: Symbol('ResolveComboUseCase'),

  // Use Cases - RTK & Caveman
  CompressContentUseCase: Symbol('CompressContentUseCase'),
  InjectCavemanPromptUseCase: Symbol('InjectCavemanPromptUseCase'),

  // Use Cases - Usage & Quota
  RecordUsageUseCase: Symbol('RecordUsageUseCase'),
  AggregateStatsUseCase: Symbol('AggregateStatsUseCase'),
  CheckQuotaUseCase: Symbol('CheckQuotaUseCase'),
  TrackQuotaUsageUseCase: Symbol('TrackQuotaUsageUseCase'),

  // Use Cases - Proxy Pool & MITM
  GetNextProxyUseCase: Symbol('GetNextProxyUseCase'),
  ManagePoolUseCase: Symbol('ManagePoolUseCase'),
  StartMitmProxyUseCase: Symbol('StartMitmProxyUseCase'),
} as const;

export type TokenKey = keyof typeof TOKENS;
