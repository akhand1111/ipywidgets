// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    CoreDescriptionModel
} from './widget_core';

import {
    DescriptionView
} from './widget_description';

import {
    uuid
} from './utils';

import {
    DOMWidgetView
} from '@jupyter-widgets/base';

import * as _ from 'underscore';

/**
 * Class name for a combobox with an invlid value.
 */
const INVALID_VALUE_CLASS = 'jpwidgets-invalidComboValue';

/**
* https://www.typescriptlang.org/docs/handbook/mixins.html
**/
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

/**
 * Handler for widget drop events
 * Can be used to create droppable widgets
 */
class Droppable extends DOMWidgetView {
    _handle_drop(event) {
        event.preventDefault();
        // var data = Array.from(event.dataTransfer.items, item => item.getAsString())
        var data = [];

        for (var i=0; i < event.dataTransfer.types.length; i++) {
          var t = event.dataTransfer.types[i];
          data.push({type: t, value: event.dataTransfer.getData(t)})
        }

        var datamap = new Object();

        for (var i=0; i < event.dataTransfer.types.length; i++) {
          var t = event.dataTransfer.types[i];
          datamap[t] = event.dataTransfer.getData(t);
        }

        console.log(event.dataTransfer);
        this.send({event: 'drop', data: datamap});
    }

    /**
     * Dictionary of events and handlers
     */
    events(): {[e:string] : string;}
    {
        return {'drop': '_handle_drop'};
    }
}

export
class StringModel extends CoreDescriptionModel {
    defaults() {
        return _.extend(super.defaults(), {
            value: '',
            disabled: false,
            placeholder: '\u200b',
            _model_name: 'StringModel'
        });
    }
}

export
class HTMLModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'HTMLView',
            _model_name: 'HTMLModel'
        });
    }
}

export
class HTMLView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-html');
        this.content = document.createElement('div');
        this.content.classList.add('widget-html-content');
        this.el.appendChild(this.content);
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.content.innerHTML = this.model.get('value');
        return super.update();
    }

    content: HTMLDivElement;
}


export
class HTMLMathModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'HTMLMathView',
            _model_name: 'HTMLMathModel'
        });
    }
}

export
class HTMLMathView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-htmlmath');
        this.content = document.createElement('div');
        this.content.classList.add('widget-htmlmath-content');
        this.el.appendChild(this.content);
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     */
    update() {
        this.content.innerHTML = this.model.get('value');
        this.typeset(this.content);
        return super.update();
    }

    content: HTMLDivElement;
}

export
class LabelModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'LabelView',
            _model_name: 'LabelModel',
            draggable : false,
            drag_data: {}
        });
    }
}

class Droppable {

    send : (content : any, buffers? : any) => void;

    _handle_drop(event) {
        event.preventDefault();
        // var data = Array.from(event.dataTransfer.items, item => item.getAsString())

        let datamap = {};

        for (let i=0; i < event.dataTransfer.types.length; i++) {
          let t = event.dataTransfer.types[i];
          datamap[t] = event.dataTransfer.getData(t);
        }

        console.log(event.dataTransfer);
        this.send({event: 'drop', data: datamap});
    }

}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

export
class LabelView extends DescriptionView implements Droppable {
    /**
     * Called when view is rendered.
     */

    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-label');
        this.dragSetup();
        this.model.on('change:draggable', this.dragSetup, this);

        this.el.addEventListener('dragover', (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = 'copy';
        });

        this.update(); // Set defaults.

    }

    dragSetup() {
      this.el.draggable = this.model.get('draggable');
    }

    on_dragstart(event) {
        event.dataTransfer.setData('text/plain', this.model.get('value'));
        let drag_data = this.model.get('drag_data');
        for (let datatype in drag_data) {
          event.dataTransfer.setData(datatype, drag_data[datatype]);
        }
        event.dataTransfer.setData('application/x-widget', this.model.model_id);
        event.dataTransfer.dropEffect = 'copy';
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        this.typeset(this.el, this.model.get('value'));
        return super.update();
    }


    /**
     * Dictionary of events and handlers
     */
    events(): {[e:string] : string;}
    {
        return {'drop': '_handle_drop',
                'dragstart' : 'on_dragstart' };
    }

    _handle_drop : (event: Object) => void;

}

applyMixins(LabelView, [Droppable]);

export
class TextareaModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'TextareaView',
            _model_name: 'TextareaModel',
            rows: null,
            continuous_update: true,
        });
    }
}

export
class TextareaView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-textarea');

        this.textbox = document.createElement('textarea');
        this.textbox.setAttribute('rows', '5');
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.

        this.listenTo(this.model, 'change:placeholder',
            (model, value, options) => {
                this.update_placeholder(value);
        });

        this.update_placeholder();
    }

    update_placeholder(value?: string) {
        value = value || this.model.get('placeholder');
        this.textbox.setAttribute('placeholder', value.toString());
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?: any) {
        if (options === undefined || options.updated_view != this) {
            this.textbox.value = this.model.get('value');
            let rows = this.model.get('rows');
            if (rows === null) {
                rows = '';
            }
            this.textbox.setAttribute('rows', rows);
            this.textbox.disabled = this.model.get('disabled');
        }
        return super.update();
    }

    events() {
        return {
            'keydown input': 'handleKeyDown',
            'keypress input': 'handleKeypress',
            'input textarea': 'handleChanging',
            'change textarea': 'handleChanged'
        };
    }

    /**
     * Handle key down
     *
     * Stop propagation so the event isn't sent to the application.
     */
    handleKeyDown(e: Event) {
        e.stopPropagation();
    }

    /**
     * Handles key press
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    handleKeypress(e: Event) {
        e.stopPropagation();
    }

    /**
     * Triggered on input change
     */
    handleChanging(e: Event) {
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    }

    /**
     * Sync the value with the kernel.
     *
     * @param e Event
     */
    handleChanged(e: Event) {
        let target = e.target as HTMLTextAreaElement;
        this.model.set('value', target.value, {updated_view: this});
        this.touch();
    }
    textbox: HTMLTextAreaElement;
}

export
class TextModel extends StringModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'TextView',
            _model_name: 'TextModel',
            continuous_update: true,
        });
    }
}

export
class TextView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-text');

        this.textbox = document.createElement('input');
        this.textbox.setAttribute('type', this.inputType);
        this.textbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.textbox);

        this.update(); // Set defaults.
        this.listenTo(this.model, 'change:placeholder', (model, value, options) => {
            this.update_placeholder(value);
        });
        this.listenTo(this.model, 'change:description_tooltip', this.update_title);
        this.listenTo(this.model, 'change:description', this.update_title);

        this.update_placeholder();
        this.update_title();
    }

    update_placeholder(value?: string) {
        this.textbox.setAttribute('placeholder', value || this.model.get('placeholder'));
    }

    update_title() {
        let title = this.model.get('description_tooltip');
        if (!title) {
            this.textbox.removeAttribute('title');
        } else if (this.model.get('description').length === 0) {
            this.textbox.setAttribute('title', title);
        }
    }

    update(options?: any) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        if (options === undefined || options.updated_view !== this) {
            if (this.textbox.value !== this.model.get('value')) {
                this.textbox.value = this.model.get('value');
            }

            this.textbox.disabled = this.model.get('disabled');
        }
        return super.update();
    }

    events() {
        return {
            'keydown input': 'handleKeyDown',
            'keypress input': 'handleKeypress',
            'input input': 'handleChanging',
            'change input': 'handleChanged'
        };
    }

    /**
     * Handle key down
     *
     * Stop propagation so the keypress isn't sent to the application.
     */
    handleKeyDown(e: Event) {
        e.stopPropagation();
    }

    /**
     * Handles text submission
     */
    handleKeypress(e: KeyboardEvent) {
        e.stopPropagation();
        // The submit message is deprecated in widgets 7
        if (e.keyCode === 13) { // Return key
            this.send({event: 'submit'});
        }
    }

    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanging(e: Event) {
        if (this.model.get('continuous_update')) {
            this.handleChanged(e);
        }
    }

    /**
     * Handles user input.
     *
     * Calling model.set will trigger all of the other views of the
     * model to update.
     */
    handleChanged(e: Event) {
        let target = e.target as HTMLInputElement;
        this.model.set('value', target.value, {updated_view: this});
        this.touch();
    }


    protected readonly inputType: string = 'text';
    textbox: HTMLInputElement;
}

export
class PasswordModel extends TextModel {
    defaults() {
        return _.extend(super.defaults(), {
            _view_name: 'PasswordView',
            _model_name: 'PasswordModel'
        });
    }
}

export
class PasswordView extends TextView {
    protected readonly inputType: string = 'password';
}


/**
 * Combobox widget model class.
 */
export
class ComboboxModel extends TextModel {
    defaults() {
        return {...super.defaults(),
            _model_name: 'ComboboxModel',
            _view_name: 'ComboboxView',
            options: [],
            ensure_options: false,
        };
    }
}


/**
 * Combobox widget view class.
 */
export
class ComboboxView extends TextView {
    render() {
        this.datalist = document.createElement('datalist');
        this.datalist.id = uuid();

        super.render();

        this.textbox.setAttribute('list', this.datalist.id);
        this.el.appendChild(this.datalist);
    }

    update(options?: any) {
        super.update(options);
        if (!this.datalist) {
            return;
        }

        const valid = this.isValid(this.model.get('value'));
        this.highlightValidState(valid);

        // Check if we need to update options
        if ((options !== undefined && options.updated_view) || (
            !this.model.hasChanged('options') &&
            !this.isInitialRender
        )) {
            // Value update only, keep current options
            return;
        }

        this.isInitialRender = false;

        const opts = this.model.get('options') as string[];
        const optLines = opts.map(o => {
            return `<option value="${o}"></option>`;
        });
        this.datalist.innerHTML = optLines.join('\n');
    }

    isValid(value: string): boolean {
        if (true === this.model.get('ensure_option')) {
            const options = this.model.get('options') as string[];
            if (options.indexOf(value) === -1) {
                return false;
            }
        }
        return true;
    }

    handleChanging(e: KeyboardEvent) {
        // Override to validate value
        const target = e.target as HTMLInputElement;
        const valid = this.isValid(target.value);
        this.highlightValidState(valid);
        if (valid) {
            super.handleChanging(e);
        }
    }

    handleChanged(e: KeyboardEvent) {
        // Override to validate value
        const target = e.target as HTMLInputElement;
        const valid = this.isValid(target.value);
        this.highlightValidState(valid);
        if (valid) {
            super.handleChanged(e);
        }
    }

    highlightValidState(valid: boolean): void {
        this.textbox.classList.toggle(INVALID_VALUE_CLASS, !valid);
    }

    datalist: HTMLDataListElement | undefined;

    isInitialRender = true;
}
