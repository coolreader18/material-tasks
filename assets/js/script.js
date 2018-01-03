var libLoad;
{
  let lresolve;
  libLoad = new Promise(resolve => {lresolve = resolve});
  libLoad.resolve = lresolve;
};
angular.module('Tasks', ['ngMaterial'])
.controller('tasks', function($scope, $mdDialog, $mdSidenav, $timeout) {
  $scope.toggleNav = () => {
    $mdSidenav('left').toggle()
  }
  $scope.curlist = {};
  $scope.tasks = [];
  libLoad.then(() => {
    $scope.$watch("curlist", list => {
      gapi.client.tasks.tasks.list({tasklist: list.id})
      .then(tasks => {
        $scope.tasks = tasks.result;
        $scope.tasks.id = list.id;
        $scope.$apply();
      })
    })
  });
  $scope.$watch("tasks", (tasks, oldtasks) => {
    var olditems = oldtasks.items;
    if (olditems) {
      tasks.items.forEach((item, i) => {
        if (!angular.equals(item, olditems[i])) {
          gapi.client.tasks.tasks.update({tasklist: tasks.id, task: item.id, resource: item}).execute();
        }
      });
    }
  }, true);
}).controller("tasklists", function($scope) {
  $scope.switchList = list => {
    $scope.$parent.curlist = list;
  };
  $scope.tasklists = [];
  libLoad.then(() => gapi.client.tasks.tasklists.list())
  .then(lists => {
    $scope.tasklists = lists.result.items;
    $scope.switchList($scope.tasklists[0]);
    $scope.$apply();
  })
}).controller("auth", function($scope) {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: 'AIzaSyBKAlslAUMhsb2wmEjwdfn3Pd7p2R8GMWg',
      clientId: '940842536640-km0uo71m05gtff1tb7dc8u90af0jfve7.apps.googleusercontent.com',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"],
      scope: 'https://www.googleapis.com/auth/tasks'
    }).then(() => {
      libLoad.resolve()
      var signedIn = gapi.auth2.getAuthInstance().isSignedIn;
      signedIn.listen(status => {
        $scope.auth = status;
        $scope.$apply();
      }).trigger(signedIn.get());
    });
  });
  $scope.authToggle = () => {
    gapi.auth2.getAuthInstance()[$scope.auth ? 'signOut' : 'signIn']();
  };
});
