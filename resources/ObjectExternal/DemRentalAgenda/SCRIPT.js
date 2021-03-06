var DemRentalAgenda = typeof DemRentalAgenda !== "undefined" ? DemRentalAgenda : (function($) {

var loc, debug = true;

function render(url) {
	$ui.getUIObject("DemRental", "agenda_DemRental", function(l) {
		loc = l;
		loc.getMetaData(calendar);
	});
}

function calendar() {
	$("#rentalcalendar").fullCalendar({
		header: {
			left: "prev,next today",
			center: "title",
			right: "month,agendaWeek,agendaDay"
		},
		timezone: "local",
		defaultView: "month",
		editable: true,
		firstDay: 1,
		minTime: "06:00:00",
		maxTime: "22:00:00",
		businessHours: {
			dow: [ 1, 2, 3, 4, 5 ],
			start: '06:00',
			end: '22:00'
		},
		eventClick: function(e) {
			if (debug) console.log("Rental " + e.id + " clicked");
			$ui.displayForm(null, "DemRental", e.id, { nav: "add" });
		},
		eventDrop: function(e) {
			var s = e.start.format( "YYYY-MM-DD HH:mm:ss");
			if (debug) console.log("Rental " + e.id + " dropped to " + s);
			e.data.demRenStartDate = s;
			loc.update(function() {
				e.data = loc.item;
				if (debug) console.debug("Rental " + e.data.demReqReference + " rental date updated to " + s);
			}, e.data);
		},
		events: function(start, end, tz, callback) {
			var f = "YYYY-MM-DD HH:mm:ss Z";
			var dmin = start.format(f);
			var dmax = end.format(f);
			if (debug) console.debug("Calendar view range = " + dmin + " to " + dmax);
			loc.search(function() {
				if (debug) console.debug(loc.list.length + " rentals found between " + dmin + " and " + dmax);
				var evts = [];
				for (var i = 0; i < loc.list.length; i++) {
					var item = loc.list[i];
					if (item.demRenStartDate !== "") { // ZZZ When using intervals empty values are included !
						var s = moment(item.demRenStartDate);
						var e = moment(item.demRenEndDate);
						evts.push({
							id: item.row_id,
							data: item,
							title: item.demReqReference + ": " + item.demReqTitle,
							start: s,
							end: e,
							editable: true,
							durationEditable: false,
							color: item.demReqStatus == "PENDING" ? "orange" : (item.demReqStatus == "VALIDATED" ? "green" : (item.demReqStatus == "REJECTEDMAN" ? "red" : "gray")),
							borderColor: "lightgray",
							textColor: "white"
						});
					}
				}
				if (debug) console.debug(evts.length + " rental displayed between " + dmin + " and " + dmax);
				callback(evts);
			}, { demRenStartDate: dmin + ";"}, { inlineDocs: false });
		}
	});
}

return { render: render };

})(jQuery);

