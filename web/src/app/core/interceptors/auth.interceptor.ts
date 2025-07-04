import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();
    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true // for sending cookie
      });
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !this.isRefreshing
        ) {
          this.isRefreshing = true;

          return this.tokenService.refreshToken().pipe(
            switchMap((res: any) => {
              this.isRefreshing = false;
              this.tokenService.saveToken(res.token);

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.token}`
                },
                withCredentials: true
              });

              return next.handle(retryReq);
            }),
            catchError((err) => {
              this.isRefreshing = false;
              this.tokenService.removeToken();
              window.location.href = '/auth/login';
              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
