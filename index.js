import { dissolveName, excludeBlank } from './helpers';

export default function FormDataTree( formData ) {
	this.tree = new Map();

	if ( ! ( formData instanceof FormData ) ) {
		throw new TypeError( "'formData' is not a FormData object" );
	}

	const createBranch = () => {
		const branch = new Map();
		branch.largestIndex = 0;

		branch.set = ( key, value ) => {
			if ( '' === key ) {
				key = branch.largestIndex++;
			} else if ( /^[0-9]+$/.test( key ) ) {
				key = parseInt( key );

				if ( branch.largestIndex <= key ) {
					branch.largestIndex = key + 1;
				}
			}

			return Map.prototype.set.call( branch, key, value );
		};

		return branch;
	};

	this.tree = createBranch();

	for ( const [ key, value ] of formData ) {
		const nameParts = dissolveName( key );
		const lastName = nameParts.pop();

		if ( undefined === lastName ) {
			continue;
		}

		const terminalNode = nameParts.reduce( ( node, name ) => {
			if ( /^[0-9]+$/.test( name ) ) {
				name = parseInt( name );
			}

			if ( node.get( name ) instanceof Map ) {
				return node.get( name );
			}

			const branch = createBranch();
			node.set( name, branch );
			return branch;
		}, this.tree );

		terminalNode.set( lastName, value );
	}
}


/**
 * Retrieves a multi-layered map associated with the given field name.
 */
FormDataTree.prototype.getAll = function ( name, filter = 'string' ) {
	const nameParts = dissolveName( name );

	if ( ! nameParts.length ) {
		return new Map();
	}

	let tree = this.tree, currentNamePart;

	while ( currentNamePart = nameParts.shift() ) {
		if ( tree.has( currentNamePart ) ) {
			tree = tree.get( currentNamePart );
		} else {
			return new Map();
		}
	}

	tree = excludeBlank( tree, filter );

	if ( ! tree ) {
		tree = new Map();
	} else if ( ! ( tree instanceof Map ) ) {
		tree = new Map( [ [ 0, tree ] ] );
	}

	return tree;
};


/**
 * Retrieves a multi-layered map of files associated with the given field name.
 */
FormDataTree.prototype.getAllFiles = function ( name ) {
	return this.getAll( name, 'file' );
};
