
import { Overlay, PositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Output } from '@angular/core';
import { NewsessionComponent } from '../components/newsession/newsession.component';
import { JoinsessionComponent } from '../components/joinsession/joinession.component';

@Injectable()
export class JoinSessionService {

  private overlayRef : OverlayRef;

  // Inject overlay service
  constructor(private overlay: Overlay) { }

  open() {
    // Returns an OverlayRef (which is a PortalHost)
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerVertically().right('0px'),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop'
    });

    // Create ComponentPortal that can be attached to a PortalHost
    const componentPortal = new ComponentPortal(JoinsessionComponent);

    // Attach ComponentPortal to PortalHost
    const ref = this.overlayRef.attach(componentPortal);

    // Close on backDrop
    this.overlayRef.backdropClick().subscribe( () => {
      this.close();
    });

    // Subscribe to portal component eventemitter.
    ref.instance.close.subscribe({
      next: () => this.close()
    });

  }

  close() {
    this.overlayRef.detach();
  }

}