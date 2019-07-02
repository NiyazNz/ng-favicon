import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import {HighlightService} from './highlight.service';


@Component({
    selector: '[lang]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="code-block">
            <pre [class.pre-scrollable]="limitY"><code class="language-{{ lang }}" [innerHTML]="code"></code></pre>
            <span *ngIf="filename" class="code-filename bg-light" title="Source code filename">{{ filename }}</span>
        </div>
    `,
    styles: [`
        .code-block {
            position: relative;
        }

        .code-filename {
            position: absolute;
            top: 0;
            right: 0;
        }
    `]
})
export class CodeComponent implements OnChanges {
    @Input() lang: string;
    @Input() code: string;
    @Input() filename?: string;
    @Input() limitY: boolean;

    constructor(private highlightService: HighlightService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            this.code = this.highlightService.highlight(changes.code.currentValue, changes.lang.currentValue);
        }
    }

}
