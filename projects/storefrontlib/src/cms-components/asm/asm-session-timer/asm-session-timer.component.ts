import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { AsmConfig, AuthService, RoutingService } from '@spartacus/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AsmComponentService } from '../services/asm-component.service';

@Component({
  selector: 'cx-asm-session-timer',
  templateUrl: './asm-session-timer.component.html',
  styleUrls: ['./asm-session-timer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AsmSessionTimerComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private interval: any;
  private maxStartDelayInSeconds = 60000;
  timeLeft: number;

  constructor(
    private config: AsmConfig,
    private asmComponentService: AsmComponentService,
    private authService: AuthService,
    private routingService: RoutingService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.timeLeft = this.getTimerStartDelayInSeconds();
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
        this.asmComponentService.logoutCustomerSupportAgentAndCustomer();
      }
      this.changeDetectorRef.markForCheck();
    }, 1000);

    this.resetOnNavigate();
    this.resetOnCustomerSessionChange();
  }

  private resetOnNavigate(): void {
    this.subscriptions.add(
      this.routingService.isNavigating().subscribe((isNavigating) => {
        if (isNavigating) {
          this.resetTimer();
        }
      })
    );
  }

  private resetOnCustomerSessionChange(): void {
    this.subscriptions.add(
      this.authService
        .getOccUserId()
        .pipe(distinctUntilChanged())
        .subscribe(() => this.resetTimer())
    );
  }

  resetTimer(): void {
    if (this.timeLeft > 0) {
      this.timeLeft = this.getTimerStartDelayInSeconds();
    }
  }

  private getTimerStartDelayInSeconds(): number {
    if (
      this.config.asm.agentSessionTimer.startingDelayInSeconds >
      this.maxStartDelayInSeconds
    ) {
      return this.maxStartDelayInSeconds;
    } else {
      return this.config.asm.agentSessionTimer.startingDelayInSeconds;
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
