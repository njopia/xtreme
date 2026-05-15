import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

const ROLE_HIERARCHY: UserRole[] = ['guest', 'player', 'vip', 'moderator', 'admin'];

export const roleGuard = (requiredRole: UserRole): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.currentUser();
    if (!user) return router.createUrlTree(['/auth/login']);

    const userLevel = ROLE_HIERARCHY.indexOf(user.role);
    const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

    if (userLevel >= requiredLevel) return true;
    return router.createUrlTree(['/']);
  };
};
