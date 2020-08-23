#include <WiFi.h>
#include <HTTPClient.h>
#include <string.h>
#include <base64.h>

const char* ssid = "WIFI_SSID";
const char* password = "WIFI_PASSWORD";

const String BaseURL = "https://us-central1-rest2zep.cloudfunctions.net/rest2zep/api/v1/users/";
const String UserID = "REST_USERID";
const String Token = "REST_TOKEN";

const int StartButton = 12;
const int EndButton = 14;

const int RedLED = 22;
const int GreenLED = 23;

volatile bool sending = false;

void setup() {
  Serial.begin(115200);
  delay(4000);

  pinMode(StartButton, INPUT);
  pinMode(EndButton, INPUT);

  pinMode(RedLED, OUTPUT);
  pinMode(GreenLED, OUTPUT);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) { //Check for the connection
    delay(500);
    Serial.println("Connecting..");
  }

  Serial.print("Connected to the WiFi network with IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if(WiFi.status() != WL_CONNECTED) {
    // If WiFi not connected, no need to check the buttons
    return;
  }

  if(sending) {
    // if a request is being sent, no need to check the buttons
    return;
  }

  if (digitalRead(StartButton) == HIGH) {
    // Start button pressed
    sendRequest("start");
  } else if (digitalRead(EndButton) == HIGH) {
    // Ende button pressed
    sendRequest("end");
  }

}



void sendRequest(const String action) {
  sending = true;

  String URL = BaseURL + UserID + (String)"/" + action;
  String base64 = base64::encode(UserID + (String)":" + Token);

  Serial.println((String)"Sending POST: " + URL);
  Serial.println((String)"Authorization: Basic " + base64);

  HTTPClient http;

  // Specify destination for HTTP request
  http.begin(URL);
  // Set POST Headers
  http.addHeader("Authorization", "Basic " + base64);
  http.addHeader("content-length", "0");

  // Send the actual POST request
  int httpResponseCode = http.POST("");

  if(httpResponseCode == 200) {
    Serial.println(httpResponseCode);
    // Show green light
    digitalWrite(GreenLED, HIGH);
  } else {
    Serial.print("Error on sending request: ");
    Serial.println(httpResponseCode);
    // Show red light
    digitalWrite(RedLED, HIGH);
  }

  http.end();

  delay(2000);

  digitalWrite(RedLED, LOW);
  digitalWrite(GreenLED, LOW);

  sending = false;
}
