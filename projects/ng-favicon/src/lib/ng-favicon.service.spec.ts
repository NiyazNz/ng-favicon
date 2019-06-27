import {TestBed} from '@angular/core/testing';

import {NgFaviconService} from './ng-favicon.service';


describe('NgFaviconService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: NgFaviconService = TestBed.get(NgFaviconService);
        expect(service).toBeTruthy();
    });
});
