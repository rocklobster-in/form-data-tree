import { dissolveName, excludeBlank } from './helpers';

export default function FormDataTree() {
	this.branches = new Map();
	this.largestIndex = 0;
}

FormDataTree.prototype = {
	get( key ) {
		return this.branches.get( key );
	},

	getAll( name, filter = 'string' ) {
		// TODO
	},

	getAllFiles( name ) {
		// TODO
	},

	has( key ) {
		return this.branches.has( key );
	},

	set( key, value ) {
		if ( '' === key ) {
			key = this.largestIndex++;
		} else if ( /^[0-9]+$/.test( key ) ) {
			key = parseInt( key );

			if ( this.largestIndex <= key ) {
				this.largestIndex = key + 1;
			}
		}

		if ( ! ( value instanceof FormDataTree || value instanceof File ) ) {
			value = value.toString();
		}

		this.branches.set( key, value );

		return this;
	},
};


FormDataTree.from = function ( formData ) {
	if ( ! ( formData instanceof FormData ) ) {
		throw new TypeError( "'formData' is not a FormData object" );
	}

	const tree = new FormDataTree();

	for ( const [ key, value ] of formData ) {
		const nameParts = dissolveName( key );

		if ( ! nameParts.length ) {
			continue;
		}

		const lastName = nameParts.pop();

		const terminalNode = nameParts.reduce( ( previous, current ) => {
			if ( previous.get( current ) instanceof FormDataTree ) {
				return previous.get( current );
			}

			const branch = new FormDataTree();

			previous.set( current, branch );

			return branch;
		}, tree );

		terminalNode.set( lastName, value );
	}

	return tree;
}
