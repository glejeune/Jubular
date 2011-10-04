if (Jabular.lastMessageReceived < ${message_id}) {
   Element.update(
      "result", "${response}"
      // Error 
      // "<div class=\"error\">${error}</div>"
   );
   Jabular.onRegexSuccess(${message_id});
}
