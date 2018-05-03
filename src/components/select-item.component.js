import _ from 'lodash';

import template from './select-item.component.html';

let $data;

class controller {

    static get $inject() {
        return ['opendash/services/data'];
    }

    constructor(dataService) {
        $data = dataService;

        this.output = [];
        this.dropdownValue = null;
    }

    $onInit() {
        if (!_.isObject(this.config)) {
            throw new Error('Bad usage of od-select-item config attribute. Must be an object.');
        }

        if (!_.isFunction(this.watch)) {
            throw new Error('Bad usage of od-select-item output attribute. Must be an array.');
        }

        const query = $data.query();

        if (this.config.root) {
            query.root();
        }

        if (this.config.containers) {
            query.container();
        }

        if (this.config.items) {
            query.items();
        }

        if (this.config.filter && _.isFunction(this.config.filter)) {
            query.filter(this.config.filter);
        }

        if (this.config.type) {
            this.available = $data.listByType(this.config.type, query.run());
            this.vo = true;
        } else {
            this.available = query.run();
            this.vo = false;
        }
    }

    dropdownOnChange() {
        this.watch(this.dropdownValue.value);
    }

    get dropdownOptions() {
        if (this.vo) {
            return this.available.map(item => {
                return {
                    id: JSON.stringify([item[0].id, item[1]]),
                    value: [item[0].id, item[1]],
                    name: `${ item[0].name } - ${ item[0].valueTypes[item[1]].name }`,
                };
            });
        } else {
            return this.available.map(item => {
                return {
                    id: item.id,
                    value: item.id,
                    name: item.name,
                };
            });
        }
    }

    isSelected(e) {
        if (this.vo) {
            return (_.find(this.output, o => o[0] === e[0] && o[1] === e[1])) ? true : false;
        } else {
            return this.output.indexOf(e) >= 0;
        }
    }

    toggleSelected(e) {
        let isSelected = this.isSelected(e);

        if (!this.config.multi) {
            this.output.length = 0;
        }

        if (isSelected) {
            if (this.vo) {
                _.remove(this.output, o => o[0] === e[0] && o[1] === e[1]);
            } else {
                _.pull(this.output, e);
            }
        } else {
            this.output.push(e);
        }

        if (this.config.multi) {
            this.watch(this.output);
        } else {
            this.watch(this.output[0] || undefined);
        }
    }
}

let component = {
    controller,
    template,
    bindings: {
        config: '<',
        watch: '<',
    },
};

export default component;