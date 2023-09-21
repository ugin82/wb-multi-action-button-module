/**
 * Version: 0.3.3
 * 
 * Function that identifies what kind of button press was performed: 
 * - Short press: single, double, triple, etc. - you can add more if you need
 * - Long press (and release)
 * - Long press (without release)
 * Script also assigns an action for each type of button press.
 *
 * @param  {string} trigger         -  Name of device and control in the following format: "<device>/<control>".
 * @param  {object} action          -  Defines actions to be taken for each type of button press.
 *                                  Key: "singlePress" or "doublePress" or "triplePress" or "longPress" or "longRelease", or "shortLongPress" (and ...Release) or 
                                          doubleShortLongPress (and ...Release)
 *                                  Value: Object having the following structure {func: <function name>, prop: <array of parameters to be passed>}
 *                                  Example:
 *                                  {
 *                                      singlePress: {func: myFunc1, prop: ["wb-mr6c_1", "K1"]},
 *                                      doublePress: {func: myFunc2, prop: ["wb-mrgbw-d_2", "RGB", "255;177;85"]},
 *                                      triplePress: {func: myFunc3, prop: []},
 *                                      longPress: {func: myFunc4, prop: []},
 *                                      longRelease: {func: myFunc5, prop: []}
 *                                  }
 * @param  {number} timeToNextPress -  Time (ms) after button up to wait for the next press before reseting the counter. Default is 300 ms.
 * @param  {number} timeOfLongPress -  Time (ms) after button down to be considered as as a long press. Default is 1000 ms (1 sec).
 * @param  {number} intervalOfRepeat - Time (ms) before repeating action specified in LongPress action. Default is 100 ms.
 * 
 * Note: In case longRelease function defined, longPress function will repeate till button is released.
 *       In case longRelease function not defined, only one action will be executed for longPress.
 */
var ActionButtons = {};
var writeLog = false;

ActionButtons.onButtonPress = function (trigger, action, timeToNextPress, timeOfLongPress, intervalOfRepeat) {
    
  // Set default values if not passed into function
  timeToNextPress = timeToNextPress || 300;
  timeOfLongPress = timeOfLongPress || 1000;
  intervalOfRepeat = intervalOfRepeat || 100;

  var buttonPressedCounter = 0;
  var shortLongPressedCounter = 0;
  var timerWaitNextShortPress = undefined;
  var timerLongPress = undefined;
  var timerWaitLongRelease = []; //undefined;
  var isLongPressed = false;
  var isLongReleased = false;

  var ruleName = "on_button_press_" + trigger.replace("/", "_");

  if (writeLog) {
    log("ActionButtons:: Define WB Rule:", ruleName)
  };

  defineRule(ruleName, {
    whenChanged: trigger,
    then: function(newValue, devName, cellName) {

      // If button is pressed, wait for a Long Press
      if (newValue) {

        if (typeof timerWaitNextShortPress == "number") {
          if (writeLog) {
            log("ActionButtons::timerWaitNextShortPress: clear timeout on press", timerWaitNextShortPress)
          };
          clearTimeout(timerWaitNextShortPress);
          timerWaitNextShortPress = undefined;
        }
        if (typeof timerLongPress == "number") {
          if (writeLog) {
            log("ActionButtons::timerLongPress: clear timeout on press", timerLongPress)
          };
          clearTimeout(timerLongPress);
          timerLongPress = undefined;
        }
        timerLongPress = setTimeout(function() {
          // Long Press identified, we will skip short press
          isLongPressed = true;
          isLongReleased = false;
          actionRepeatCounter = 1;
          switch (buttonPressedCounter) {
            // Counter equals 0 - it's a single long press
            case 0:
              if (writeLog) {
                log("ActionButtons:: long press started")
              };

              shortLongPressedCounter = 0;
              if (typeof action.longPress === "object") {
                if (typeof action.longPress.func === "function") {
                  if (writeLog) {
                    log("ActionButtons:: long press - press")
                  };
                  action.longPress.func.apply(this, action.longPress.prop);

                  // If Long Release action defined, we will repeat Long Press action till not released. Otherwise only 1 Long Press action is executed
                  if (typeof action.longRelease === "object") {
                    if (typeof action.longRelease.func === "function") {
                      timerWaitLongRelease[0] = setInterval(function() {
                        if (!isLongReleased) {
                          if (typeof action.longPress === "object") {
                            if (typeof action.longPress.func === "function") {
                              action.longPress.func.apply(this, action.longPress.prop);
                            }
                          }
                          if (writeLog) {
                            log("ActionButtons:: long press - press actions counter (" + actionRepeatCounter++ + ") ")
                          };
                        }
                        if (isLongReleased) {
                          clearInterval(timerWaitLongRelease[0]);
                        }
                      }, intervalOfRepeat);
                    }
                  }

                }
              }
              break;
              // Counter equals 1 - it's a single short + long press
            case 1:
              if (writeLog) {
                log("ActionButtons:: shortLong press started")
              };

              shortLongPressedCounter = 1;
              if (typeof action.shortLongPress === "object") {
                if (typeof action.shortLongPress.func === "function") {
                  if (writeLog) {
                    log("ActionButtons:: short long press - press")
                  };
                  action.shortLongPress.func.apply(this, action.shortLongPress.prop);

                  // If Long Release action defined, we will repeat Long Press action till not released. Otherwise only 1 Long Press action is executed
                  if (typeof action.shortLongRelease === "object") {
                    if (typeof action.shortLongRelease.func === "function") {
                      timerWaitLongRelease[1] = setInterval(function() {
                        if (!isLongReleased) {
                          if (typeof action.shortLongPress === "object") {
                            if (typeof action.shortLongPress.func === "function") {
                              action.shortLongPress.func.apply(this, action.shortLongPress.prop);
                            }
                          }
                          if (writeLog) {
                            log("ActionButtons:: short long press - press actions counter (" + actionRepeatCounter++ + ") ")
                          };
                        }
                        if (isLongReleased) {
                          clearInterval(timerWaitLongRelease[1]);
                        }
                      }, intervalOfRepeat);
                    }
                  }

                }
              }
              break;
              // Counter equals 2 - it's a double short + long press
            case 2:
              if (writeLog) {
                log("ActionButtons:: doubleShortLong press started")
              };

              shortLongPressedCounter = 2;
              if (typeof action.doubleShortLongPress === "object") {
                if (typeof action.doubleShortLongPress.func === "function") {
                  if (writeLog) {
                    log("ActionButtons::doubleShort long press - press")
                  };
                  action.doubleShortLongPress.func.apply(this, action.doubleShortLongPress.prop);

                  // If Long Release action defined, we will repeat Long Press action till not released. Otherwise only 1 Long Press action is executed
                  if (typeof action.doubleShortLongRelease === "object") {
                    if (typeof action.doubleShortLongRelease.func === "function") {
                      timerWaitLongRelease[2] = setInterval(function() {
                        if (!isLongReleased) {
                          if (typeof action.doubleShortLongPress === "object") {
                            if (typeof action.doubleShortLongPress.func === "function") {
                              action.doubleShortLongPress.func.apply(this, action.doubleShortLongPress.prop);
                            }
                          }
                          if (writeLog) {
                            log("ActionButtons:: doubleShort long press - press actions counter (" + actionRepeatCounter++ + ") ")
                          };
                        }
                        if (isLongReleased) {
                          clearInterval(timerWaitLongRelease[2]);
                        }
                      }, intervalOfRepeat);
                    }
                  }

                }
              }
              break;
          }
          // Reset the counter
          buttonPressedCounter = 0;
          timerLongPress = undefined;
        }, timeOfLongPress);

      }

      // If button is released, then it is not a Long Press, start to count clicks
      else {
        if (!isLongPressed) {
          if (typeof timerLongPress == "number") {
            if (writeLog) {
              log("ActionButtons::timerLongPress: clear timeout on release", timerLongPress)
            };
            clearTimeout(timerLongPress);
            timerLongPress = undefined;
          }
          buttonPressedCounter += 1;
          if (typeof timerWaitNextShortPress == "number") {
            if (writeLog) {
              log("ActionButtons::timerWaitNextShortPress: clear timeout on release", timerWaitNextShortPress)
            };
            clearTimeout(timerWaitNextShortPress);
            timerWaitNextShortPress = undefined;
          }
          timerWaitNextShortPress = setTimeout(function() {
            switch (buttonPressedCounter) {
              // Counter equals 1 - it's a single short press
              case 1:
                if (typeof action.singlePress === "object") {
                  if (typeof action.singlePress.func === "function") {
                    action.singlePress.func.apply(this, action.singlePress.prop);
                  }
                }
                if (writeLog) {
                  log("ActionButtons:: short press single")
                };
                break;
                // Counter equals 2 - it's a double short press
              case 2:
                if (typeof action.doublePress === "object") {
                  if (typeof action.doublePress.func === "function") {
                    action.doublePress.func.apply(this, action.doublePress.prop);
                  }
                }
                if (writeLog) {
                  log("ActionButtons:: short press double")
                };
                break;
                // Counter equals 3 - it's a triple short press
              case 3:
                if (typeof action.triplePress === "object") {
                  if (typeof action.triplePress.func === "function") {
                    action.triplePress.func.apply(this, action.triplePress.prop);
                  }
                }
                if (writeLog) {
                  log("ActionButtons:: short press triple")
                };
                break;
                // You can add more cases here to track more clicks
            }
            // Reset the counter
            buttonPressedCounter = 0;
            timerWaitNextShortPress = undefined;
          }, timeToNextPress);
        }

        // Catch button released after long press
        else {
          switch (shortLongPressedCounter) {
            // Counter equals 0 - it's a single long press
            case 0:
              if (writeLog) {
                log("ActionButtons:: long press release")
              };
              clearInterval(timerWaitLongRelease[0]);
              if (typeof action.longRelease === "object") {
                if (typeof action.longRelease.func === "function") {
                  action.longRelease.func.apply(this, action.longRelease.prop);
                }
              }
              break;
              // Counter equals 1 - it's a single short + long press
            case 1:
              if (writeLog) {
                log("ActionButtons:: short long press release")
              };
              clearInterval(timerWaitLongRelease[1]);
              if (typeof action.shortLongRelease === "object") {
                if (typeof action.shortLongRelease.func === "function") {
                  action.shortLongRelease.func.apply(this, action.shortLongRelease.prop);
                }
              }
              break;
              // Counter equals 2 - it's a double short + long press
            case 2:
              if (writeLog) {
                log("ActionButtons:: double short long press release")
              };
              clearInterval(timerWaitLongRelease[2]);
              if (typeof action.doubleShortLongRelease === "object") {
                if (typeof action.doubleShortLongRelease.func === "function") {
                  action.doubleShortLongRelease.func.apply(this, action.doubleShortLongRelease.prop);
                }
              }
              break;
          }
          isLongPressed = false;
          isLongReleased = true;
        }
      }

    }
  });
};

ActionButons.setDebugMode = function(status) {
  writeLog = status;
};

exports.ActionButtons = ActionButtons;
