import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ForumCategory, ForumPost, ForumThread } from '../models/forum.model';

const MOCK_CATEGORIES: ForumCategory[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Discusión general sobre los servidores y la comunidad',
    icon: 'forum',
    threadCount: 142,
    postCount: 1847,
    order: 1,
    lastPost: {
      threadTitle: '¿Nuevo mapa disponible esta semana?',
      threadId: 't1',
      authorUsername: 'SurvivorPro',
      createdAt: new Date(Date.now() - 1000 * 60 * 23),
    },
  },
  {
    id: 'rules',
    name: 'Reglas del servidor',
    description: 'Normas de conducta y reglamento oficial',
    icon: 'gavel',
    threadCount: 8,
    postCount: 34,
    order: 2,
    lastPost: {
      threadTitle: 'Actualización de reglas v2.3',
      threadId: 't2',
      authorUsername: 'Admin_Xtreme',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
  },
  {
    id: 'bugs',
    name: 'Reportar bugs',
    description: 'Reporta errores o problemas técnicos en los servidores',
    icon: 'bug_report',
    threadCount: 57,
    postCount: 312,
    order: 3,
    lastPost: {
      threadTitle: 'Crash al cargar Dead Center',
      threadId: 't3',
      authorUsername: 'ZombiSlayer99',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  },
  {
    id: 'suggestions',
    name: 'Sugerencias',
    description: 'Propone nuevas ideas y mejoras para la comunidad',
    icon: 'lightbulb',
    threadCount: 89,
    postCount: 640,
    order: 4,
    lastPost: {
      threadTitle: 'Agregar modo VS en servidor 2',
      threadId: 't4',
      authorUsername: 'ModWatcher',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  },
  {
    id: 'offtopic',
    name: 'Off-Topic',
    description: 'Charla libre, memes y todo lo demás',
    icon: 'chat_bubble',
    threadCount: 203,
    postCount: 3241,
    order: 5,
    lastPost: {
      threadTitle: 'Rate de FPS en máquinas viejas',
      threadId: 't5',
      authorUsername: 'NewSurvivor',
      createdAt: new Date(Date.now() - 1000 * 60 * 8),
    },
  },
];

const MOCK_THREADS: ForumThread[] = [
  {
    id: 't1',
    categoryId: 'general',
    title: '¿Nuevo mapa disponible esta semana?',
    authorId: '2',
    authorUsername: 'SurvivorPro',
    authorRole: 'vip',
    content:
      'Escuché que van a agregar un nuevo mapa custom esta semana. ¿Alguien sabe cuál es? Tengo ganas de probar algo nuevo después de tanto tiempo en Blood Harvest.',
    createdAt: new Date(Date.now() - 1000 * 60 * 23),
    replyCount: 12,
    viewCount: 148,
    isPinned: false,
    isLocked: false,
    tags: ['mapa', 'anuncio'],
  },
  {
    id: 't2',
    categoryId: 'rules',
    title: 'Actualización de reglas v2.3',
    authorId: '1',
    authorUsername: 'Admin_Xtreme',
    authorRole: 'admin',
    content:
      'Se actualizaron las reglas del servidor. Por favor leer antes de jugar. Se agregaron restricciones sobre spawn camping y el uso de exploits conocidos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    replyCount: 5,
    viewCount: 923,
    isPinned: true,
    isLocked: false,
    tags: ['oficial', 'reglas'],
  },
  {
    id: 't3',
    categoryId: 'bugs',
    title: 'Crash al cargar Dead Center',
    authorId: '3',
    authorUsername: 'ZombiSlayer99',
    authorRole: 'player',
    content:
      'El servidor crashea cada vez que se vota para ir a Dead Center capítulo 3. Ya pasó 3 veces hoy. Logs adjuntos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    replyCount: 8,
    viewCount: 76,
    isPinned: false,
    isLocked: false,
    tags: ['crash', 'dead-center'],
  },
  {
    id: 't4',
    categoryId: 'suggestions',
    title: 'Agregar modo VS en servidor 2',
    authorId: '4',
    authorUsername: 'ModWatcher',
    authorRole: 'moderator',
    content:
      'Propongo habilitar modo VS permanente en el servidor 2. Muchos usuarios lo han pedido y actualmente solo está disponible por votación.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    replyCount: 21,
    viewCount: 204,
    isPinned: false,
    isLocked: false,
    tags: ['vs', 'servidor-2'],
  },
  {
    id: 't5',
    categoryId: 'offtopic',
    title: 'Rate de FPS en máquinas viejas',
    authorId: '5',
    authorUsername: 'NewSurvivor',
    authorRole: 'player',
    content:
      '¿Alguien más juega en una PC de 2012? Logro mantener 60fps con todo en bajo. ¿Qué configuración usan?',
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    replyCount: 34,
    viewCount: 512,
    isPinned: false,
    isLocked: false,
    tags: ['fps', 'hardware'],
  },
];

const MOCK_POSTS: ForumPost[] = [
  {
    id: 'p1',
    threadId: 't1',
    authorId: '2',
    authorUsername: 'SurvivorPro',
    authorRole: 'vip',
    authorPostCount: 234,
    authorJoinedAt: new Date('2023-03-22'),
    content:
      'Escuché que van a agregar un nuevo mapa custom esta semana. ¿Alguien sabe cuál es?',
    createdAt: new Date(Date.now() - 1000 * 60 * 23),
    isEdited: false,
  },
  {
    id: 'p2',
    threadId: 't1',
    authorId: '1',
    authorUsername: 'Admin_Xtreme',
    authorRole: 'admin',
    authorPostCount: 842,
    authorJoinedAt: new Date('2022-01-15'),
    content:
      'Confirmado, esta noche subo el mapa "Dead Before Dawn DC". Lo estuvimos testeando esta semana y quedó muy bien.',
    createdAt: new Date(Date.now() - 1000 * 60 * 18),
    isEdited: false,
  },
  {
    id: 'p3',
    threadId: 't1',
    authorId: '4',
    authorUsername: 'ModWatcher',
    authorRole: 'moderator',
    authorPostCount: 512,
    authorJoinedAt: new Date('2022-08-05'),
    content: 'Excelente elección. Lo jugué en otro servidor y es muy entretenido.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    isEdited: false,
  },
];

@Injectable({ providedIn: 'root' })
export class ForumService {
  getCategories(): Observable<ForumCategory[]> {
    return of([...MOCK_CATEGORIES]).pipe(delay(300));
  }

  getThreadsByCategory(categoryId: string): Observable<ForumThread[]> {
    return of(MOCK_THREADS.filter((t) => t.categoryId === categoryId)).pipe(delay(300));
  }

  getThread(threadId: string): Observable<ForumThread | undefined> {
    return of(MOCK_THREADS.find((t) => t.id === threadId)).pipe(delay(200));
  }

  getPostsByThread(threadId: string): Observable<ForumPost[]> {
    return of(MOCK_POSTS.filter((p) => p.threadId === threadId)).pipe(delay(300));
  }

  getRecentThreads(limit = 5): Observable<ForumThread[]> {
    return of(
      [...MOCK_THREADS].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit)
    ).pipe(delay(200));
  }
}
