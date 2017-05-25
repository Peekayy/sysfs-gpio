const expect = require("chai").expect;
const fs = require("fs");
const sinon = require("sinon");

let fsMap = {};

sinon.stub(fs, "writeFile").callsFake(function(file, data, cb) {
    if (file.match(/\/export$/)) {
        if (fsMap["/sys/class/gpio/gpio" + data]) {
            throw {message: "gpio already exported", code: "EBUSY"};
        } else {
            fsMap["/sys/class/gpio/gpio" + data] = "exported";
        }
    }
    fsMap[file] = data;
    cb();
});

sinon.stub(fs, "readFile").callsFake(function(file, cb) {
    cb(fsMap[file]);
});

const testGpioMapping = {
    GPIO1: 1,
    GPIO2: 2
};

const GPIO = require("../lib/gpio.js")(testGpioMapping);

describe("new GPIO", function() {
    it("should create a valid gpio using a mapped GPIO name", function() {
        var gpio = new GPIO("GPIO1");
        expect(gpio.pinName).to.be.equal("gpio1");
    });

    it("should create a valid gpio using a gpio number", function() {
        var gpio = new GPIO(1);
        expect(gpio.pinName).to.be.equal("gpio1");
    });

    it("should fail when creating gpio with unmapped GPIO name", function() {
        expect(_ => {
            new GPIO("invalidGpio");
        }).to.throw(Error);
    });
});

describe("open()", function() {

    let gpio;

    beforeEach(function() {
        // reset fake fs
        fsMap = {};
        gpio = new GPIO("GPIO1");
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

    it("should work even if gpio was already openned", function() {
        return gpio.open().then(function() {
            let gpio2 = new GPIO("GPIO1");
            return gpio2.open();
        });
    });
});

describe("close()", function() {
    let gpio;

    beforeEach(function() {
        // reset fake fs
        fsMap = {};
        gpio = new GPIO("GPIO1");
        gpio.open();
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
    let gpio;

    beforeEach(function() {
        // reset fake fs
        fsMap = {};
        gpio = new GPIO("GPIO1");
        gpio.open();
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
    let gpio;

    beforeEach(function() {
        // reset fake fs
        fsMap = {};
        gpio = new GPIO("GPIO1");
        gpio.open();
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

