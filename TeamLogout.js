var finesse = finesse || {};
finesse.gadget = finesse.gadget || {};
finesse.container = finesse.container || {};
clientLogs = finesse.cslogger.ClientLogger || {}; // for logging

/**
 * The following comment prevents JSLint errors concerning the logFinesse function being undefined.
 * logFinesse is defined in Log.js, which should also be included by gadget the includes this file.
 */
/*global logFinesse */

/** @namespace */
finesse.modules = finesse.modules || {};
finesse.modules.TeamLogout = (function($) {
    var user, activeId, selected_index, userIds, usersCollection, _team, team_value, states, dialogs, clientlogs,

        /**
         * Populates the fields in the gadget with data
         */
        render = function() {
            var currentState = user.getState();
            gadgets.window.adjustHeight();
        },



        /**
         * Handler for the onLoad of a User object. This occurs when the User object is initially read
         * from the Finesse server. Any once only initialization should be done within this function.
         */
        handleUserLoad = function(userevent) {
            var i, out = "";

            _team = user.getSupervisedTeams();
            i = _team.length;
            while (i > 0)

            {
                i--;
                out = '<li><a href="#">' + _team[i].name + '</a></li>' + out;
            }

            $('#dropdownTeamsList').html(out);

            $(".dropdown-menu li a").click(function() {
                var selText = $(this).text();
                $(this).parents('.dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
                selected_index = $(this).closest('li').index();
                activeId = _team[selected_index].id;

                team_value = new finesse.restservices.Team({
                    id: activeId,
                    onLoad: _handleTeamLoad,
                    onChange: _handleTeamChange
                });




            });
            render();
        },


        _onTeamUsersLoad = function(users) {

            usersCollection = users.getCollection();
            userIds = Object.keys(usersCollection);
            $('#userlist').text(JSON.stringify(userIds));



        },
        _onTeamError = function() {},


        _handleTeamLoad = function(team) {

            var teams_users = {};
            teams_users = team.getUsers({
                onLoad: _onTeamUsersLoad,
                onError: _onTeamError
            });

        },

        _handleTeamChange = function(_team) {

        },

        /**
         *  Handler for all User updates
         */
        handleUserChange = function(userevent) {
            render();
        };

    return {
        /**
         * Sets the user state
         */
        setUserState: function() {

            var count = userIds.length;
            while (count > 0) {
                count--;
                console.log('user id ' + userIds[count] + 'agent previous state ' + usersCollection[userIds[count]].getState());
                usersCollection[userIds[count]].setState(states.LOGOUT)
                console.log('Logout sent for  user id ' + userIds[count]);
            }

        },

        /**
         * Performs all initialization for this gadget
         */
        init: function() {
            var cfg = finesse.gadget.Config;

            clientLogs = finesse.cslogger.ClientLogger; // declare clientLogs

            gadgets.window.adjustHeight();

            // Initiate the ClientServices and load the user object. ClientServices are
            // initialized with a reference to the current configuration.
            finesse.clientservices.ClientServices.init(cfg, false);

            // Initiate the ClientLogs. The gadget id will be logged as a part of the message
            clientLogs.init(gadgets.Hub, "TeamLogoutGadget");

            user = new finesse.restservices.User({
                id: cfg.id,
                onLoad: handleUserLoad,
                onChange: handleUserChange
            });

            states = finesse.restservices.User.States;


            // Initiate the ContainerServices and add a handler for when the tab is visible
            // to adjust the height of this gadget in case the tab was not visible
            // when the html was rendered (adjustHeight only works when tab is visible)
            containerServices = finesse.containerservices.ContainerServices.init();
            containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, function() {
                clientLogs.log("Gadget is now visible"); // log to Finesse logger
                // automatically adjust the height of the gadget to show the html
                gadgets.window.adjustHeight();
            });
            containerServices.makeActiveTabReq();
        }
    };
}(jQuery));