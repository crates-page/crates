import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthInterceptor } from './shared/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { metaReducers, reducers } from './store/reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { UserEffects } from './user/store/effects/user.effects';
import { SocialEffects } from './shared/store/effects/social.effects';
import { CollectionEffects } from './shared/store/effects/collection.effects';
import { DiscoverEffects } from './shared/store/effects/discover.effects';
import { SearchEffects } from './shared/store/effects/search.effects';
import { TrendingEffects } from './shared/store/effects/trending.effects';
import { ActivityEffects } from './shared/store/effects/activity.effects';
import { MobileFooterComponent } from './layout/mobile-footer/mobile-footer.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    MobileFooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    SharedModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    EffectsModule.forRoot([
      UserEffects,
      SocialEffects,
      CollectionEffects,
      DiscoverEffects,
      SearchEffects,
      TrendingEffects,
      ActivityEffects
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
