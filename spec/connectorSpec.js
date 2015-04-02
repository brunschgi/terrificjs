describe('Connector', function(){
	'use strict';

	beforeEach(function () {
		this.connector = new T.Connector(new T.Sandbox(new T.Application(), {}));
	});

	describe('.on(event, listener)', function(){

		it('should add listeners', function(){
			var calls = [];

			this.connector.on('foo', function(val){
				calls.push('one', val);
			});

			this.connector.on('foo', function(val){
				calls.push('two', val);
			});

			this.connector.emit('foo', 1);
			this.connector.emit('bar', 1);
			this.connector.emit('foo', 2);

			expect(calls).toEqual([ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ]);
		});

		it('should add listeners for events which are same names with methods of Object.prototype', function(){
			var calls = [];

			this.connector.on('constructor', function(val){
				calls.push('one', val);
			});

			this.connector.on('__proto__', function(val){
				calls.push('two', val);
			});

			this.connector.emit('constructor', 1);
			this.connector.emit('__proto__', 2);

			expect(calls).toEqual([ 'one', 1, 'two', 2 ]);
		});
	});

	describe('.once(event, listener)', function(){
		it('should add a single-shot listener', function(){
			var calls = [];

			this.connector.once('foo', function(val){
				calls.push('one', val);
			});

			this.connector.emit('foo', 1);
			this.connector.emit('foo', 2);
			this.connector.emit('foo', 3);
			this.connector.emit('bar', 1);

			expect(calls).toEqual([ 'one', 1 ]);
		});
	});

	describe('.off(event, listener)', function(){
		it('should remove a listener', function(){
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			this.connector.on('foo', one);
			this.connector.on('foo', two);
			this.connector.off('foo', two);

			this.connector.emit('foo');

			expect(calls).toEqual([ 'one' ]);
		});

		it('should work with .once()', function(){
			var calls = [];

			function one() { calls.push('one'); }

			this.connector.once('foo', one);
			this.connector.once('fee', one);
			this.connector.off('foo', one);

			this.connector.emit('foo');

			expect(calls).toEqual([]);
		});

		it('should work when called from an event', function(){
			var called;

			function b () {
				called = true;
			}

			this.connector.on('tobi', function () {
				this.connector.off('tobi', b);
			}.bind(this));

			this.connector.on('tobi', b);
			this.connector.emit('tobi');
			expect(called).toBeTruthy();

			called = false;
			this.connector.emit('tobi');
			expect(called).toBeFalsy();
		});
	});

	describe('.off(event)', function(){
		it('should remove all listeners for an event', function(){
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			this.connector.on('foo', one);
			this.connector.on('foo', two);
			this.connector.off('foo');

			this.connector.emit('foo');
			this.connector.emit('foo');

			expect(calls).toEqual([]);
		});
	});

	describe('.off()', function(){
		it('should remove all listeners', function(){
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			this.connector.on('foo', one);
			this.connector.on('bar', two);

			this.connector.emit('foo');
			this.connector.emit('bar');

			this.connector.off();

			this.connector.emit('foo');
			this.connector.emit('bar');

			expect(calls).toEqual(['one', 'two']);
		});
	});

	describe('.listeners(event)', function(){
		describe('when handlers are present', function(){
			it('should return an array of callbacks', function(){
				function foo(){}
				this.connector.on('foo', foo);
				expect(this.connector.listeners('foo')).toEqual([foo]);
			});
		});

		describe('when no handlers are present', function(){
			it('should return an empty array', function(){
				expect(this.connector.listeners('foo')).toEqual([]);
			});
		});
	});

	describe('.hasListeners(event)', function(){
		describe('when handlers are present', function(){
			it('should return true', function(){
				this.connector.on('foo', function(){});
				expect(this.connector.hasListeners('foo')).toBeTruthy();
			});
		});

		describe('when no handlers are present', function(){
			it('should return false', function(){
				expect(this.connector.hasListeners('foo')).toBeFalsy();
			});
		});
	});
});