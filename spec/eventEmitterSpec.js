describe('EventEmitter', function(){
	'use strict';

	beforeEach(function () {
		this.sandbox = new T.Sandbox(new T.Application(), {});
		this.eventEmitter = new T.EventEmitter(this.sandbox);
	});

	describe('.on(event, listener)', function(){
		it('should call connect', function() {
			spyOn(this.eventEmitter, 'connect').and.callThrough();

			this.eventEmitter.on('foo', function() {});

			expect(this.eventEmitter.connect).toHaveBeenCalled();
		});

		it('should add listeners', function(){
			var calls = [];

			this.eventEmitter.on('foo', function(val){
				calls.push('one', val);
			});

			this.eventEmitter.on('foo', function(val){
				calls.push('two', val);
			});

			this.eventEmitter.emit('foo', 1);
			this.eventEmitter.emit('bar', 1);
			this.eventEmitter.emit('foo', 2);

			expect(calls).toEqual([ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ]);
		});

		it('should add listeners for events which are same names with methods of Object.prototype', function(){
			var calls = [];

			this.eventEmitter.on('constructor', function(val){
				calls.push('one', val);
			});

			this.eventEmitter.on('__proto__', function(val){
				calls.push('two', val);
			});

			this.eventEmitter.emit('constructor', 1);
			this.eventEmitter.emit('__proto__', 2);

			expect(calls).toEqual([ 'one', 1, 'two', 2 ]);
		});
	});

	describe('.once(event, listener)', function(){
		it('should call connect', function() {
			spyOn(this.eventEmitter, 'connect').and.callThrough();

			this.eventEmitter.on('foo', function() {});

			expect(this.eventEmitter.connect).toHaveBeenCalled();
		});

		it('should add a single-shot listener', function(){
			var calls = [];

			this.eventEmitter.once('foo', function(val){
				calls.push('one', val);
			});

			this.eventEmitter.emit('foo', 1);
			this.eventEmitter.emit('foo', 2);
			this.eventEmitter.emit('foo', 3);
			this.eventEmitter.emit('bar', 1);

			expect(calls).toEqual([ 'one', 1 ]);
		});
	});

	describe('.off(event, listener)', function(){
		it('should remove a listener', function(){
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			this.eventEmitter.on('foo', one);
			this.eventEmitter.on('foo', two);
			this.eventEmitter.off('foo', two);

			this.eventEmitter.emit('foo');

			expect(calls).toEqual([ 'one' ]);
		});

		it('should work with .once()', function(){
			var calls = [];

			function one() { calls.push('one'); }

			this.eventEmitter.once('foo', one);
			this.eventEmitter.once('fee', one);
			this.eventEmitter.off('foo', one);

			this.eventEmitter.emit('foo');

			expect(calls).toEqual([]);
		});

		it('should work when called from an event', function(){
			var called;

			function b () {
				called = true;
			}

			this.eventEmitter.on('foo', function () {
				this.eventEmitter.off('foo', b);
			}.bind(this));

			this.eventEmitter.on('foo', b);
			this.eventEmitter.emit('foo');
			expect(called).toBeTruthy();

			called = false;
			this.eventEmitter.emit('foo');
			expect(called).toBeFalsy();
		});
	});

	describe('.off(event)', function(){
		it('should remove all listeners for an event', function(){
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			this.eventEmitter.on('foo', one);
			this.eventEmitter.on('foo', two);
			this.eventEmitter.off('foo');

			this.eventEmitter.emit('foo');
			this.eventEmitter.emit('foo');

			expect(calls).toEqual([]);
		});
	});

	describe('.off()', function(){
		it('should remove all listeners', function(){
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			this.eventEmitter.on('foo', one);
			this.eventEmitter.on('bar', two);

			this.eventEmitter.emit('foo');
			this.eventEmitter.emit('bar');

			this.eventEmitter.off();

			this.eventEmitter.emit('foo');
			this.eventEmitter.emit('bar');

			expect(calls).toEqual(['one', 'two']);
		});
	});

	describe('.emit(event, arguments)', function(){
		it('should call connect', function() {
			spyOn(this.eventEmitter, 'connect').and.callThrough();

			this.eventEmitter.on('foo', function() {});

			expect(this.eventEmitter.connect).toHaveBeenCalled();
		});

		it('should delegate to the sandbox dispatch method', function() {
			spyOn(this.sandbox, 'dispatch').and.callThrough();

			this.eventEmitter.emit('foo', 1, 'foo', { foo: 'bar'});

			expect(this.sandbox.dispatch).toHaveBeenCalledWith('foo', 1, 'foo', { foo: 'bar'});
		});
	});

	describe('.handle(event, arguments)', function(){
		it('should handle the emitted event', function() {
			spyOn(this.eventEmitter, 'handle').and.callThrough();

			this.eventEmitter.emit('foo', 1, 'foo', { foo: 'bar'});

			expect(this.eventEmitter.handle).toHaveBeenCalledWith('foo', 1, 'foo', { foo: 'bar'});
		});
	});

	describe('.connect()', function(){
		it('should add itself to the sandbox', function() {
			spyOn(this.sandbox, 'addEventEmitter').and.callThrough();

			this.eventEmitter.connect();

			expect(this.sandbox.addEventEmitter).toHaveBeenCalledWith(this.eventEmitter);
		});

		it('should add itself only once to the sandbox', function() {
			spyOn(this.sandbox, 'addEventEmitter').and.callThrough();

			this.eventEmitter.connect();
			this.eventEmitter.connect();

			expect(this.sandbox.addEventEmitter.calls.count()).toEqual(1);
		});

		it('should set _connected to true', function() {
			this.eventEmitter.connect();

			expect(this.eventEmitter._connected).toBeTruthy();
		});
	});

	describe('.disconnect()', function(){
		it('should remove itself from the sandbox', function() {
			spyOn(this.sandbox, 'removeEventEmitter').and.callThrough();

			this.eventEmitter.connect();
			this.eventEmitter.disconnect();

			expect(this.sandbox.removeEventEmitter).toHaveBeenCalledWith(this.eventEmitter);
		});

		it('should set _connected to false', function() {
			this.eventEmitter.connect();
			this.eventEmitter.disconnect();

			expect(this.eventEmitter._connected).toBeFalsy();
		});

		it('should do nothing if not already connected', function() {
			this.eventEmitter.disconnect();

			expect(this.eventEmitter._connected).toBeFalsy();
		});
	});

	describe('.listeners(event)', function(){
		describe('when handlers are present', function(){
			it('should return an array of callbacks', function(){
				function foo(){}
				this.eventEmitter.on('foo', foo);
				expect(this.eventEmitter.listeners('foo')).toEqual([foo]);
			});
		});

		describe('when no handlers are present', function(){
			it('should return an empty array', function(){
				expect(this.eventEmitter.listeners('foo')).toEqual([]);
			});
		});
	});

	describe('.hasListeners(event)', function(){
		describe('when handlers are present', function(){
			it('should return true', function(){
				this.eventEmitter.on('foo', function(){});
				expect(this.eventEmitter.hasListeners('foo')).toBeTruthy();
			});
		});

		describe('when no handlers are present', function(){
			it('should return false', function(){
				expect(this.eventEmitter.hasListeners('foo')).toBeFalsy();
			});
		});
	});
});