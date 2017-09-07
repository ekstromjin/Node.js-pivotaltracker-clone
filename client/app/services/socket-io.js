'use strict';

angular.module('pivotalApp')
.factory('SocketIO', ['$rootScope', '$q', '$timeout', 'socketFactory', 'wsEntryPoint', 'wsConfig', 'firstLoadEventList',
  function ($rootScope, $q, $timeout, socketFactory, wsEntryPoint, wsConfig, firstLoadEventList) {
    var myIoSocket, mySocket, mySocketId;
    wsEntryPoint = wsEntryPoint || 'http://localhost:8000';  // it should be loaded from jade

    var initialLoadEvent = angular.copy(firstLoadEventList);

    myIoSocket = io.connect(wsEntryPoint, wsConfig);

    mySocket = socketFactory({
      ioSocket: myIoSocket
    });

    function sendRequest(eventName, data, socketId) {
      var requestData = angular.extend(data, {
        'socketId': socketId
      });
      mySocket.emit(eventName, requestData);
    }

    function countInitialLoadEvent(eventName) {
      if (!initialLoadEvent.length) {
        return ;
      }
      if (initialLoadEvent.indexOf(eventName) > -1) {
        initialLoadEvent.splice(initialLoadEvent.indexOf(eventName), 1);
        $rootScope.initialDataLoadedPercent =
          Math.ceil((firstLoadEventList.length - initialLoadEvent.length + 1) /
                    (firstLoadEventList.length + 1) * 100);
        // console.log('Percentage goes here:', $rootScope.initialDataLoadedPercent);
      }
      if (!initialLoadEvent.length) {
        $timeout(function () {
          $rootScope.initialDataLoaded = true;
        }, 600);
      }
    }

    var defer = $q.defer();

    // Get Socket ID;
    mySocket.on('connected', function (data) {
      if (data.socketId) {
        mySocketId = data.socketId;
        // console.log('SocketIO get socketId:', mySocketId);
        defer.resolve(mySocketId);
      } else {
        // console.log('Socket Channel[%s] Error: %s', 'connected', data.message);
      }
    });

    return {
      _mySocket: mySocket,
      _getSocketId: function () {
        return mySocketId;
      },
      emit: function (eventName, data) {
        // Check if we have socketId;
        if (mySocketId) {
          // console.log('Socket Request on [%s] channel:',eventName, data);
          sendRequest(eventName, data, mySocketId);
        } else {
          defer.promise.then(function (socketId) {
            sendRequest(eventName, data, socketId);
          });
        }
      },
      watch: function (eventName, callback) {
        mySocket.on(eventName, function (data) {
          // console.log('Socket Response on [%s] channel:',eventName, data);

          if (!data.success){
            // console.log('Socket Channel[%s] Error: %s', eventName, data.message);
            return;
          }
          $rootScope.$apply(function () {
            countInitialLoadEvent(eventName);
            callback.call(mySocket, data.message);
          });
        });
      },
      removeAllListeners: function () {
        mySocket.removeAllListeners();
      }
    };
  }
]);