import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserState } from '../store/reducers/user.reducer';
import { selectUser, selectUserLoading, selectUserError } from '../store/selectors/user.selectors';
import { loadUser, updateUserProfile, updateUserProfileResult } from '../store/actions/load-user.actions';
import { User } from '../shared/model/user.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiError } from '../../shared/model/api-error.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';
import * as NavigationActions from '../../shared/store/actions/navigation.actions';
import { selectSocialStats } from '../../shared/store/selectors/social.selectors';
import { loadSocialStats } from '../../shared/store/actions/social.actions';
import { SocialStats } from '../../shared/model/social-stats.model';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  currentUser$: Observable<User | undefined>;
  isLoading$: Observable<boolean>;
  error$: Observable<ApiError | undefined>;
  socialStats$: Observable<SocialStats | undefined>;
  successMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<UserState>,
    private router: Router,
    private location: Location,
    private actions$: Actions
  ) {
    this.profileForm = this.fb.group({
      handle: ['', [Validators.maxLength(64), Validators.pattern(/^[a-zA-Z0-9-]*$/)]],
      bio: ['', [Validators.maxLength(280)]],
      privateProfile: [false]
    });
  }

  ngOnInit(): void {
    // Set navigation context to profile
    this.store.dispatch(NavigationActions.setNavigationContext({ context: 'profile' }));
    
    // Dispatch action to load current user and social stats
    this.store.dispatch(loadUser());
    this.store.dispatch(loadSocialStats());
    
    this.currentUser$ = this.store.select(selectUser);
    this.isLoading$ = this.store.select(selectUserLoading);
    this.error$ = this.store.select(selectUserError);
    this.socialStats$ = this.store.select(selectSocialStats);
    
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        // Default username to Spotify ID if no custom handle is set
        const defaultUsername = user.handle || user.spotifyId || '';
        this.profileForm.patchValue({
          handle: defaultUsername,
          bio: user.bio || '',
          privateProfile: user.privateProfile || false
        });
      }
    });
    
    // Listen for successful profile updates
    this.actions$.pipe(
      ofType(updateUserProfileResult),
      takeUntil(this.destroy$)
    ).subscribe(action => {
      if (action.response.success) {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        // Reset form dirty state to hide save button
        this.profileForm.markAsPristine();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.successMessage = '';
      const formValue = this.profileForm.value;
      
      this.store.dispatch(updateUserProfile({
        handle: formValue.handle?.trim() || null,
        bio: formValue.bio?.trim() || null,
        privateProfile: formValue.privateProfile
      }));
    }
  }

  onCancel(): void {
    this.location.back();
  }

  get handleErrors() {
    const control = this.profileForm.get('handle');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) {
        return 'Username must be 64 characters or less';
      }
      if (control.errors['pattern']) {
        return 'Username can only contain letters, numbers, and hyphens';
      }
    }
    return null;
  }

  get bioErrors() {
    const control = this.profileForm.get('bio');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) {
        return 'Bio must be 280 characters or less';
      }
    }
    return null;
  }

  get bioCharacterCount(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  viewFollowers(): void {
    this.router.navigate(['/user/profile/settings/followers']);
  }

  viewFollowing(): void {
    this.router.navigate(['/user/profile/settings/following']);
  }
}