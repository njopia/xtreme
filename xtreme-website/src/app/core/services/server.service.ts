import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, shareReplay, startWith, switchMap, timer } from 'rxjs';
import { ServerStatus } from '../models/server.model';

@Injectable({ providedIn: 'root' })
export class ServerService {
  private http = inject(HttpClient);

  // null = loading, [] = error/empty, ServerStatus[] = data
  readonly servers = toSignal(
    timer(0, 30_000).pipe(
      switchMap(() =>
        this.http.get<ServerStatus[]>('/api/servers').pipe(
          catchError(() => of([] as ServerStatus[]))
        )
      ),
      shareReplay(1),
      startWith(null as ServerStatus[] | null),
    ),
    { requireSync: true }
  );

  readonly loading = computed(() => this.servers() === null);

  readonly totalPlayers = computed(() =>
    (this.servers() ?? []).reduce((sum, s) => sum + s.players, 0)
  );
}
