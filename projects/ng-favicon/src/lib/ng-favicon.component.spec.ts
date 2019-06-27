import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NgFaviconComponent} from './ng-favicon.component';


describe('NgFaviconComponent', () => {
    let component: NgFaviconComponent;
    let fixture: ComponentFixture<NgFaviconComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NgFaviconComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NgFaviconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
