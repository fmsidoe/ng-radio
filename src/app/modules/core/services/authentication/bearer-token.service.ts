import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfigService } from '../config.service';
import isBlank from 'is-blank';

@Injectable()
export class BearerTokenService implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private configService: ConfigService,
    private oauthService: OAuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't handle the initial config fetch at all
    if (req.url.endsWith('/assets/config/app.config.json') || req.url.endsWith('/assets/config/local.config.json')) {
      return next.handle(req);
    }
    // Wait for the config to load if it isn't loaded already
    return this.configService.appConfig$.pipe(
      switchMap(config => {
        // If the URL is one of our configured URLs which requires authentication, then provide a bearer token.
        if (req.url.startsWith(config.favoriteStationsApiUrl) || req.url.startsWith(config.metadataApiUrl)) {
          // Wait for authentication to initialize, regardless of whether the user is authenticated
          return this.authenticationService.authenticated$.pipe(
            switchMap(authenticated => authenticated && !isBlank(this.oauthService.getAccessToken())
              // If an access token is present, then append it to the Authorization header
              ? next.handle(req.clone({ headers: req.headers.append('Authorization', `Bearer ${this.oauthService.getAccessToken()}`) }))
              // If no access token is present, pass the unmodified request to the next handler
              : next.handle(req)
            )
          );
        } else {
          // If this isn't an authorization-required URL, then pass the unmodified request to the next handler
          return next.handle(req);
        }
      })
    );
  }
}