module.exports = (function(gpioConfig) {

    const fs = require("fs");
    const path = require("path");
    const sysfsPath = "/sys/class/gpio";

    /**
     * @param file
     * @param data
     * @returns {Promise}
     */
    function writeFile(file, data) {
        return new Promise((resolve, reject)=> {
            fs.writeFile(file, data, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * @param file
     * @returns {Promise}
     */
    function readFile(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * @enum {string}
     */
    const GpioDirection = {
        IN: "in",
        OUT: "out"
    };

    /**
     * @enum {number}
     */
    const GpioValue = {
        LOW: 0,
        HIGH: 1
    };

    /**
     * @typedef {string} GpioPinId
     */

    /**
     * @class
     */
    class GPIO {
        /**
         * @param {number|GpioPinId} pin
         */
        constructor(pin) {
            let parsedPin = parseInt(pin, 10);
            if (!isNaN(parsedPin)) {
                this.pin = "gpio" + parsedPin;
            } else if (gpioConfig && typeof pin === "string") {
                this.pin = "gpio" + gpioConfig[pin];
                if (!pin && pin !== 0) {
                    throw new Error("Unknown gpio pin : " + pin);
                }
            } else {
                throw new Error("Unexpected type for pin");
            }
        }

        /**
         * Opens this GPIO pin and optionally configures its direction and value.
         * @param {GpioDirection} [direction]
         * @param {GpioValue} [value]
         * @returns {Promise}
         */
        open(direction, value) {
            let promise = writeFile(`${sysfsPath}/export`, this.pin);

            if (direction) {
                promise = promise.then(_=> {
                    return this.setDirection(direction);
                });
            }
            if (value) {
                promise = promise.then(_=> {
                    return this.setValue(value);
                });
            }

            return promise
        }

        /**
         * Closes (unexports) this GPIO pin.
         * @returns {Promise}
         */
        close() {
            return writeFile(`${sysfsPath}/unexport`, this.pin);
        }

        /**
         * Get this GPIO pin direction.
         * @returns {Promise}
         */
        getDirection() {
            return readFile(`${sysfsPath}/${this.pin}/direction`);
        }

        /**
         * Sets this GPIO pin direction.
         * @param {GpioDirection} direction
         * @returns {Promise}
         */
        setDirection(direction) {
            return writeFile(`${sysfsPath}/${this.pin}/direction`, direction);
        }

        /**
         * Gets this GPIO pin value.
         * @returns {Promise}
         */
        getValue() {
            return readFile(`${sysfsPath}/${this.pin}/value`);
        }

        /**
         *
         * @param {GpioValue} value
         * @returns {Promise}
         */
        setValue(value) {
            return writeFile(`${sysfsPath}/${this.pin}/value`, value);
        }
    }

    /**
     * @type GpioDirection
     */
    GPIO.DIRECTION = GpioDirection;
    /**
     * @type GpioValue
     */
    GPIO.VALUE = GpioValue;

    return GPIO;
})();