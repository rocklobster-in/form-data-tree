import { dissolveName, excludeBlank } from './helpers';

export default function FormDataTree() {
	this.trunk = FormDataTree.branch();
}


FormDataTree.prototype = {

	getAll( name, filter = 'string' ) {
		const nameParts = dissolveName( name );

		if ( ! nameParts.length ) {
			return {};
		}

		let branch = this.trunk, currentNamePart;

		while ( currentNamePart = nameParts.shift() ) {
			if (
				/^[0-9]*$/.test( currentNamePart ) ||
				! branch.has( currentNamePart )
			) {
				return {};
			}

			branch = branch.get( currentNamePart );
		}

		branch = excludeBlank( branch, filter );

		if ( ! ( branch instanceof Object ) ) {
			branch = new Map( [ [ 0, branch ] ] );
		}

		return branch.toObject();
	},

	getAllFiles( name ) {
		return this.getAll( name, 'file' );
	},

};


FormDataTree.branch = () => {
	const map = new Map();

	map.largestIndex = 0;

	map.set = ( key, value ) => {
		if ( '' === key ) {
			key = map.largestIndex++;
		} else if ( /^[0-9]+$/.test( key ) ) {
			key = parseInt( key );

			if ( map.largestIndex <= key ) {
				map.largestIndex = key + 1;
			}
		}

		if ( ! ( value instanceof Map || value instanceof File ) ) {
			value = value.toString();
		}

		return Map.prototype.set.call( map, key, value );
	};

	map.toObject = () => {
		const resultObj = {};

		map.forEach( ( value, key ) => {
			resultObj[ key ] = Object.hasOwn( value, 'toObject' )
				? value.toObject() : value;
		} );

		return resultObj;
	};

	return map;
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
			if ( Object.hasOwn( previous.get( current ), 'set' ) ) {
				return previous.get( current );
			}

			const branch = FormDataTree.branch();

			previous.set( current, branch );

			return branch;
		}, tree.trunk );

		terminalNode.set( lastName, value );
	}

	return tree;
};
