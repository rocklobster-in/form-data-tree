import { dissolveName, excludeBlank } from './helpers';

export default function FormDataTree() {
	this.trunk = {};
	this.largestIndex = 0;
}


FormDataTree.prototype = {

	getAll( name, filter = 'string' ) {
		const nameParts = dissolveName( name );

		if ( ! nameParts.length ) {
			return {};
		}

		let branch = this, currentNamePart;

		while ( currentNamePart = nameParts.shift() ) {
			if (
				/^[0-9]*$/.test( currentNamePart ) ||
				undefined === branch.trunk[ currentNamePart ]
			) {
				return {};
			}

			branch = branch.trunk[ currentNamePart ];
		}

		const result = excludeBlank( branch.valueOf(), filter ) ?? {};

		return ( result instanceof Object ) ? result : { 0: result };
	},

	getAllFiles( name ) {
		return this.getAll( name, 'file' );
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

		if ( ! ( value instanceof Object ) ) {
			value = value.toString();
		}

		this.trunk[ key.toString() ] = value;

		return this;
	},

	valueOf() {
		const obj = {};

		for ( const [ key, value ] of Object.entries( this.trunk ) ) {
			obj[ key ] = value.valueOf();
		}

		return obj;
	},

};


FormDataTree.from = formData => {
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
			if ( previous.trunk[ current ] instanceof FormDataTree ) {
				return previous.trunk[ current ];
			}

			const newNode = new FormDataTree();

			previous.set( current, newNode );

			return newNode;
		}, tree );

		terminalNode.set( lastName, value );
	}

	return tree;
};
