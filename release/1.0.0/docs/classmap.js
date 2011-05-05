YAHOO.env.classMap = {"Tc.Sandbox": "Tc\nIncludes:\nSimple JavaScript Inheritance\nBy John Resig http://ejohn.org/\nMIT Licensed.", "Tc.Connector": "Tc\nIncludes:\nSimple JavaScript Inheritance\nBy John Resig http://ejohn.org/\nMIT Licensed.", "Tc.Config": "Tc\nIncludes:\nSimple JavaScript Inheritance\nBy John Resig http://ejohn.org/\nMIT Licensed.", "Tc.Utils.String": "Tc\nIncludes:\nSimple JavaScript Inheritance\nBy John Resig http://ejohn.org/\nMIT Licensed.", "Tc.Module": "Tc\nIncludes:\nSimple JavaScript Inheritance\nBy John Resig http://ejohn.org/\nMIT Licensed.", "Tc.Application": "Tc\nIncludes:\nSimple JavaScript Inheritance\nBy John Resig http://ejohn.org/\nMIT Licensed."};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
