/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        // Initialize your app
        var myApp = new Framework7({
            animateNavBackIcon:true
        });

        // Export selectors engine
        var $$ = Dom7;

        // Add main View
        var mainView = myApp.addView('.view-main', {
            // Enable dynamic Navbar
            dynamicNavbar: true,
            // Enable Dom Cache so we can use all inline pages
            domCache: true
        });

        var progressContainer = $$('#submitProcess');

        var ptrContent = $$('.pull-to-refresh-content');
       

        var CwwVM = function() {
            var self = this;
            
            self.weight = ko.observable();
            self.note = ko.observable();

            self.observations = ko.observableArray([]);

            self.newGoalWeight = ko.observable();
            self.newGoalDate = ko.observable();

            self.submitForm = function() {
                myApp.showProgressbar(progressContainer);
                var data = {
                    weight: self.weight(),
                    note: self.note(),
                    nonStandard: myApp.formToJSON('#wwForm').nonStandard[0]
                }
                $.ajax({
                    type: "POST",
                    url: "http://192.168.1.106:7071/api/observations",
                    data: data,
                    success: function(response) {
                        myApp.hideProgressbar(progressContainer);
                        $('#submitStatus p').html('succes');
                        $('#submitStatus').show(500);
                    },
                    error: function(err,status) {
                        myApp.hideProgressbar(progressContainer);
                        $('#submitStatus p').html(err.responseText);
                        $('#submitStatus').show(500);
                    }
                });
            }

            self.updateGoal = function() {
                console.log("Clickediclick:" + self.newGoalDate() + ", " + self.newGoalWeight());
            }

            self.fetchObservations = function() {
                $.ajax({
                    type: "GET",
                    url: "http://192.168.1.106:7071/api/observations",
                    success: function(observations) {
                        var mappedObservations = observations.map(function(observation) {
                            return {
                                weight: observation.weight,
                                date: moment(observation.observedDate).format("MMM Do")
                            }
                        });

                        self.observations(mappedObservations);
                        console.log(mappedObservations);
                        myApp.pullToRefreshDone();

                    },
                    error: function(err,status) {
                        console.log(err);
                    }
                });
            }

            self.applyF7Bindings = function() {
                ptrContent.on('refresh', function(e) {
                    self.fetchObservations();
                });

                var goalCalendar = myApp.calendar({
                    input: '#goalCalendar',
                });
            }

            self.init = function() {
                self.applyF7Bindings();
                self.fetchObservations();
            }
        }

        var vm = new CwwVM();
        vm.init();
        ko.applyBindings(vm);

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();