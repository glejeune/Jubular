var Jabular = {
  
  lastMessageSent: 0,
  lastMessageReceived: -1,
  testStringHasFocus: false,
  disabled: false,
  inFailureState: false,
  
  example: function() {
    $('regex').value = "\\A([^@\\s]+)@((?:[-a-z0-9]+\\.)+[a-z]{2,})\\Z";
    $('test').value = "launch@bacon.com";
    $('options').value = "i";
  },
  
  clearFields: function(regex, options, test) {
    $('regex').value = Jabular.useIfDefined(regex);
    $('options').value = Jabular.useIfDefined(options);
    $('test').value = Jabular.useIfDefined(test);
  },
  
  useIfDefined: function(s) {
    return typeof s == 'undefined' ? '' : s;
  },
  
  showSpinner: function() {
    $('ajax_loader_wrapper').show();
  },
  
  hideSpinner: function() {
    $('ajax_loader_wrapper').hide();
  },
  
  testRegex: function(element, value, opts) {
    var options = Object.extend(
      {force: false},
      opts || {}
    );
    if (this.isEditorEmpty() || (this.disabled && !options.force)) {
      return;
    } else {
      this.showSpinner();
      new Ajax.Request('/regex/do_test?message_id=' + ++this.lastMessageSent,
        {
          asynchronous:true,
          evalScripts:true,
          parameters:value,
          on0: this.onRegexFailure.bind(this),
          onFailure: this.onRegexFailure.bind(this)
        }
      );
    }
  },
  
  onRegexSuccess: function(messageId) {
    this.lastMessageReceived = messageId;
    if (this.lastMessageSent == this.lastMessageReceived) {
      this.hideSpinner();
    }
    if (this.inFailureState) {
      this.inFailureState = false;
      this.showAjaxNote("Success!");
    }
  },
    
  onRegexFailure: function(transport) {
    if (this.disabled) {
      return false;
    }
    this.showAjaxNote(
      "Oops, there was an error handling your regex. We'll try again in a few seconds.",
      {fade: false}
    );
    this.hideSpinner();
    this.disabled = true;
    this.inFailureState = true;
    setTimeout(function() {
      this.showAjaxNote('Ok, trying again...', {fade: false});
      this.showSpinner();
      setTimeout(function() {
        this.disabled = false;
        this.testRegex(
          $('test_form'),
          Form.serialize('test_form'),
          {force: true}
        );
      }.bind(this), 3000);
    }.bind(this), 6000);

  },
  
  isEditorEmpty: function() {
    return $('start_instructions') && ($('regex').value == "" || $('test').value == "");
  },
  
  insertTab: function() {
    Vendor.insertContent('test', String.fromCharCode(9));  
  },
  
  copyRegexToClipboard: function() {
    if ($('regex').value == "") {
      this.showAjaxNote('Enter a regular expression first!');
    } else {
      var s = '/' + $F('regex') + '/' + $F('options');
      Vendor.copyToClipboard(s);
      this.showAjaxNote('Your regex has been copied to your clipboard!');
    }
  },
  
  showAjaxNote: function(s, opts) {
    var options = {fade: true};
    Object.extend(options, opts || {});
    var ajax_note = $('ajax_note');
    ajax_note.innerHTML = s;
    if (options.fade) {
      setTimeout(function() {
        // if the value hasn't changed, then
        // wipe it
        if (ajax_note.innerHTML == s) {
          ajax_note.innerHTML = "&nbsp;";    
        }
      }, 6000 + (s.length * 10));
    }
  },
  
  clearAjaxNote: function() {
    $('ajax_note').innerHTML = "&nbsp;";
  },
  
  makePermalink: function() {
    if (this.isEditorEmpty()) {
      this.showAjaxNote('To create a permalink, first enter a regular expression and a test string.');
    } else {
      new Ajax.Request('/regex/make_permalink',
        {
          asynchronous:true,
          evalScripts:true,
          parameters: Form.serialize('test_form'),
          onFailure: this.onRegexFailure
        }
      );
    }
  }
    
};

Event.observe(window, 'load', function() {

  shortcut.add("Control+Shift+S", function() {
    if (Jabular.testStringHasFocus) {
      Jabular.insertTab();
    }
  });

  $('test_form').getElements().each(function(element) {
    Event.observe(element, "focus", function(event) {
      Jabular.testStringHasFocus = Event.element(event).id == "test";
    });
  });
  
  new Form.Observer(
    'test_form',
    0.2,
    function(element, value) {
      Jabular.testRegex(element, value);
    }
  );
  
});

