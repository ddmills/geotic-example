import { Component } from 'geotic';

export class Color extends Component {
    static properties = {
        value: '9b9af2',
    };

    onCollision(evt) {
        const other = evt.data.other;

        if (other.has(Color)) {
            this.value = other.color.value;
            evt.handle();
        }
    }
}
