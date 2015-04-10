describe('Connector', function(){
	'use strict';

	beforeEach(function () {
		this.sandbox = new T.Sandbox(new T.Application(), {});
		this.connector = new T.Connector(this.sandbox);
	});

	describe('.on(event, listener)', function(){
		it('should call connect', function() {
			spyOn(this.connector, 'connect').and.callThrough();

			this.connector.on('foo', function() {});

			expect(this.connector.connect).toHaveBeenCalled();
		});

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
		it('should call connect', function() {
			spyOn(this.connector, 'connect').and.callThrough();

			this.connector.on('foo', function() {});

			expect(this.connector.connect).toHaveBeenCalled();
		});

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

			this.connector.on('foo', function () {
				this.connector.off('foo', b);
			}.bind(this));

			this.connector.on('foo', b);
			this.connector.emit('foo');
			expect(called).toBeTruthy();

			called = false;
			this.connector.emit('foo');
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

	describe('.emit(event, arguments)', function(){
		it('should call connect', function() {
			spyOn(this.connector, 'connect').and.callThrough();

			this.connector.on('foo', function() {});

			expect(this.connector.connect).toHaveBeenCalled();
		});

		it('should delegate to the sandbox dispatch method', function() {
			spyOn(this.sandbox, 'dispatch').and.callThrough();

			this.connector.emit('foo', 1, 'foo', { foo: 'bar'});

			expect(this.sandbox.dispatch).toHaveBeenCalledWith('foo', 1, 'foo', { foo: 'bar'});
		});
	});

	describe('.handle(event, arguments)', function(){
		it('should handle the emitted event', function() {
			spyOn(this.connector, 'handle').and.callThrough();

			this.connector.emit('foo', 1, 'foo', { foo: 'bar'});

			expect(this.connector.handle).toHaveBeenCalledWith('foo', 1, 'foo', { foo: 'bar'});
		});
	});

	describe('.connect()', function(){
		it('should add itself to the sandbox', function() {
			spyOn(this.sandbox, 'addConnector').and.callThrough();

			this.connector.connect();

			expect(this.sandbox.addConnector).toHaveBeenCalledWith(this.connector);
		});

		it('should add itself only once to the sandbox', function() {
			spyOn(this.sandbox, 'addConnector').and.callThrough();

			this.connector.connect();
			this.connector.connect();

			expect(this.sandbox.addConnector.calls.count()).toEqual(1);
		});

		it('should set _connected to true', function() {
			this.connector.connect();

			expect(this.connector._connected).toBeTruthy();
		});
	});

	describe('.disconnect()', function(){
		it('should remove itself from the sandbox', function() {
			spyOn(this.sandbox, 'removeConnector').and.callThrough();

			this.connector.connect();
			this.connector.disconnect();

			expect(this.sandbox.removeConnector).toHaveBeenCalledWith(this.connector);
		});

		it('should set _connected to false', function() {
			this.connector.connect();
			this.connector.disconnect();

			expect(this.connector._connected).toBeFalsy();
		});

		it('should do nothing if not already connected', function() {
			this.connector.disconnect();

			expect(this.connector._connected).toBeFalsy();
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