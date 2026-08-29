import React, { useEffect, useState } from 'react'
import { offlineSyncService } from '@/lib/offlineSync'
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const ConnectivityPill: React.FC = () => {
  const [status, setStatus] = useState(offlineSyncService.getStatus())
  const { toast } = useToast()

  useEffect(() => {
    let wasOffline = !offlineSyncService.getStatus().isOnline
    let prevSyncing = false

    const unsubscribe = offlineSyncService.subscribe((newStatus) => {
      // Toast notification when transitioning from offline/syncing to fully synced online
      if (
        (wasOffline && newStatus.isOnline) ||
        (prevSyncing && !newStatus.isSyncing && newStatus.queueLength === 0)
      ) {
        toast({
          title: 'Tudo sincronizado ✓',
          description: 'Seus dados e jogadas estão atualizados na nuvem.',
          className: 'bg-emerald-600 text-white border-none',
        })
      }
      wasOffline = !newStatus.isOnline
      prevSyncing = newStatus.isSyncing
      setStatus(newStatus)
    })

    return () => unsubscribe()
  }, [toast])

  if (status.isSyncing) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold shadow-sm border border-sky-200 animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Sincronizando… ({status.queueLength})</span>
      </div>
    )
  }

  if (!status.isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold shadow-sm border border-amber-300">
        <WifiOff className="w-3.5 h-3.5 text-amber-700" />
        <span className="hidden sm:inline">Modo offline — jogadas serão salvas</span>
        <span className="sm:hidden">Offline</span>
      </div>
    )
  }

  if (status.queueLength > 0) {
    return (
      <button
        onClick={() => offlineSyncService.syncQueue()}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-full text-xs font-semibold shadow-sm border border-orange-200 transition-colors"
        title="Clique para sincronizar jogadas pendentes"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{status.queueLength} jogada(s) a sincronizar</span>
      </button>
    )
  }

  return null
}
