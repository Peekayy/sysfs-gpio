var expect = require("chai").expect;
var fs = require("fs");
var sinon = require("sinon");

var fsMap = {};

sinon.stub(fs, "writeFile").callsFake(function(file, data, cb) {
    fsMap[file] = data;
    cb();
});

sinon.stub(fs, "readFile").callsFake(function(file, cb) {
    cb(fsMap[file]);
});

var testGpioMapping = {
    GPIO1: 1,
    GPIO2: 2
};

var GPIO = require("../lib/gpio.js")(testGpioMapping);

describe("new GPIO", function() {
    it("should create a valid gpio using a mapped GPIO name", function() {
        var gpio = new GPIO("GPIO1");
        expect(gpio.pin).to.be.equal("gpio1");
    });

    it("should create a valid gpio using a gpio number", function() {
        var gpio = new GPIO(1);
        expect(gpio.pin).to.be.equal("gpio1");
    });

    it("should fail when creating gpio with unmapped GPIO name", function() {
        expect(_=> {
            new GPIO("invalidGpio");
        }).to.throw(Error);
    });
});

describe("open()", function() {

    var gpio;

    beforeEach(function() {
        gpio = new GPIO("GPIO1");
        // reset fake fs
        fsMap = {};
    });

    it("should write gpio1 to /sys/class/gpio/export when called bare", function(done) {
        gpio.open().then(function() {
            fs.readFile("/sys/class/gpio/export", function(data) {
                expect(data).to.be.equal(gpio.pin);
                done();
            });
        });
    });

    it("should also set direction", function(done) {
        gpio.open(GPIO.DIRECTION.OUT).then(function() {
            fs.readFile("/sys/class/gpio/gpio1/direction", function(data) {
                expect(data).to.be.equal(GPIO.DIRECTION.OUT);
                done();
            });
        });
    });

    it("should also set value", function(done) {
        gpio.open(null, GPIO.VALUE.HIGH).then(function() {
            fs.readFile("/sys/class/gpio/gpio1/value", function(data) {
                expect(data).to.be.equal(GPIO.VALUE.HIGH);
                done();
            });
        });
    });

    it("should set both direction and value when called with both", function(done) {
        gpio.open(GPIO.DIRECTION.OUT, GPIO.VALUE.HIGH).then(function() {
            fs.readFile("/sys/class/gpio/gpio1/value", function(data) {
                expect(data).to.be.equal(GPIO.VALUE.HIGH);
                fs.readFile("/sys/class/gpio/gpio1/direction", function(data) {
                    expect(data).to.be.equal(GPIO.DIRECTION.OUT);
                    done();
                });
            });
        });
    });
});

describe("close()", function() {
    var gpio;

    beforeEach(function() {
        gpio = new GPIO("GPIO1");
        gpio.open();
        // reset fake fs
        fsMap = {};
    });

    it("should write gpio1 to /sys/class/gpio/unexport", function(done) {
        gpio.close().then(function() {
            fs.readFile("/sys/class/gpio/unexport", function(data) {
                expect(data).to.be.equal(gpio.pin);
                done();
            });
        });
    });
});

describe("setValue()", function() {
    var gpio;

    beforeEach(function() {
        gpio = new GPIO("GPIO1");
        gpio.open();
        // reset fake fs
        fsMap = {};
    });

    it("should write \"1\" to /sys/class/gpio/gpio1/value", function(done) {
        gpio.setValue(GPIO.VALUE.HIGH).then(function() {
            fs.readFile("/sys/class/gpio/gpio1/value", function(data) {
                expect(data).to.be.equal(GPIO.VALUE.HIGH);
                done();
            });
        });
    });
});

describe("setDirection()", function() {
    var gpio;

    beforeEach(function() {
        gpio = new GPIO("GPIO1");
        gpio.open();
        // reset fake fs
        fsMap = {};
    });

    it("should write \"out\" to /sys/class/gpio/gpio1/direction", function(done) {
        gpio.setDirection(GPIO.DIRECTION.OUT).then(function() {
            fs.readFile("/sys/class/gpio/gpio1/direction", function(data) {
                expect(data).to.be.equal(GPIO.DIRECTION.OUT);
                done();
            });
        });
    });
});

