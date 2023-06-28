export {}
declare global {
  const useApi: typeof import('@swordjs/sword-framework')['useApi']
  const useApp: typeof import('@swordjs/sword-framework')['useApp']
  const useGetApiMap: typeof import('@swordjs/sword-framework')['useGetApiMap']
  const useIsDev: typeof import('@swordjs/sword-framework')['useIsDev']
  const useIsProd: typeof import('@swordjs/sword-framework')['useIsProd']
  const usePipeline: typeof import('@swordjs/sword-framework')['usePipeline']
  const usePlatform: typeof import('@swordjs/sword-framework')['usePlatform']
  const usePlatformHook: typeof import('@swordjs/sword-framework')['usePlatformHook']
  const usePlugin: typeof import('@swordjs/sword-framework')['usePlugin']
}