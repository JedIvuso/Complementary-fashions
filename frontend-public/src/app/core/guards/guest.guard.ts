import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If user is NOT logged in, allow access to guest routes (login, register, etc.)
  if (!auth.isLoggedIn()) {
    return true;
  }

  // If user IS logged in, redirect to home page
  router.navigate(["/"]);
  return false;
};
