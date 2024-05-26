import { RemoteData } from 'src/app/core/data/remote-data';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { FeedbackDataService } from 'src/app/core/feedback/feedback-data.service';
import { Component, Inject, OnInit } from '@angular/core';
import { RouteService } from 'src/app/core/services/route.service';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { Router } from '@angular/router';
import { getHomePageRoute } from 'src/app/app-routing-paths';
import { take } from 'rxjs/operators';
import {
  NativeWindowRef,
  NativeWindowService,
} from 'src/app/core/services/window.service';
import { URLCombiner } from 'src/app/core/url-combiner/url-combiner';

@Component({
  selector: 'ds-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
/**
 * Component displaying the contents of the Feedback Statement
 */
export class FeedbackFormComponent implements OnInit {
  /**
   * Form builder created used from the feedback from
   */
  feedbackForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ],
    ],
    message: ['', Validators.required],
    page: [''],
  });

  constructor(
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    public routeService: RouteService,
    private fb: UntypedFormBuilder,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    private feedbackDataService: FeedbackDataService,
    private authService: AuthService,
    private router: Router,
  ) {}

  /**
   * On init check if user is logged in and use its email if so
   */
  ngOnInit() {
    this.authService
      .getAuthenticatedUserFromStore()
      .pipe(take(1))
      .subscribe((user: EPerson) => {
        if (!!user) {
          this.feedbackForm.patchValue({ email: user.email });
        }
      });

    this.routeService
      .getPreviousUrl()
      .pipe(take(1))
      .subscribe((url: string) => {
        if (!url) {
          url = getHomePageRoute();
        }
        const relatedUrl = new URLCombiner(
          this._window.nativeWindow.origin,
          url,
        ).toString();
        this.feedbackForm.patchValue({ page: relatedUrl });
      });
  }

  /**
   * Function to create the feedback from form values
   */
  createFeedback(): void {
    const url = this.feedbackForm.value.page.replace(
      this._window.nativeWindow.origin,
      '',
    );
    this.feedbackDataService
      .create(this.feedbackForm.value)
      .pipe(getFirstCompletedRemoteData())
      .subscribe((response: RemoteData<NoContent>) => {
        if (response.isSuccess) {
          this.notificationsService.success(
            this.translate.instant('info.feedback.create.success'),
          );
          this.feedbackForm.reset();
          this.router.navigateByUrl(url);
        }
      });
  }
}
