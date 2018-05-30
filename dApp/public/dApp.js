
function daysInMonth(month) {
	var year = (new Date()).getFullYear();
	return new Date(year, month, 0).getDate();
  }
  
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var grid = {};
  for (var i = 0; i < months.length; i++) {
	grid[months[i]] = daysInMonth(i+1);
  }
  
  var moodOptions = {
	5: 'amazing',
	4: 'great',
	3: 'average',
	2: 'difficult',
	1: 'tough',
	0: 'none'
  };

  /* TODO: genericize

.grid#moodGrid
        div.item
          span
          div.days
            - each _, i in Array(31)
              span.day= i+1
        - each _, i in Array(grid[prop])
          - for (var prop in grid)
            div.item.month(data-month="#{prop}")
              span= prop[0]
              - each _, i in Array(grid[prop])
                a(href="#", data-mood="0")

  */