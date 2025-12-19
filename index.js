import { dissolveName, excludeBlank } from './helpers';

function FormDataTree( formData ) {
	this.formData = {};
	this.tree = {};

	if ( formData instanceof FormData ) {
		this.formData = formData;
	} else {
		return this;
	}

	const createBranch = () => {
		const branch = new Map();
		branch.largestIndex = 0;

		branch.set = function ( key, value ) {
			if ( '' === key ) {
				key = branch.largestIndex++;
			} else if ( /^[0-9]+$/.test( key ) ) {
				key = parseInt( key );

				if ( branch.largestIndex <= key ) {
					branch.largestIndex = key + 1;
				}
			}

			Map.prototype.set.call( branch, key, value );
		};

		return branch;
	};

	this.tree = createBranch();

	const reQueryKey = /^(?<name>[a-z][-a-z0-9_:]*)(?<array>(?:\[(?:[a-z][-a-z0-9_:]*|[0-9]*)\])*)/i;

	for ( const [ key, value ] of this.formData ) {
		const found = key.match( reQueryKey );

		if ( ! found ) {
			continue;
		}

		if ( '' === found.groups.array ) {
			this.tree.set( found.groups.name, value );
		} else {
			const arrayKeysChain = [
				...found.groups.array.matchAll( /\[([a-z][-a-z0-9_:]*|[0-9]*)\]/ig )
			].map( ( [ matched, group1 ] ) => group1 );

			arrayKeysChain.unshift( found.groups.name );
			const lastKey = arrayKeysChain.pop();

			const terminalNode = arrayKeysChain.reduce( ( prev, cur ) => {
				if ( /^[0-9]+$/.test( cur ) ) {
					cur = parseInt( cur );
				}

				if ( prev.get( cur ) instanceof Map ) {
					return prev.get( cur );
				}

				const branch = createBranch();
				prev.set( cur, branch );
				return branch;
			}, this.tree );

			terminalNode.set( lastKey, value );
		}
	}
}

FormDataTree.prototype.entries = function () {
	return this.tree.entries();
};

FormDataTree.prototype.get = function ( name ) {
	return this.tree.get( name );
};

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

FormDataTree.prototype.getAllFiles = function ( name ) {
	return this.getAll( name, 'file' );
};

FormDataTree.prototype.has = function ( name ) {
	return this.tree.has( name );
};

FormDataTree.prototype.keys = function () {
	return this.tree.keys();
};

FormDataTree.prototype.values = function () {
	return this.tree.values();
};

export default FormDataTree;
