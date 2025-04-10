
// test('should update when ready event is sent', () => {
//     const localMock = vi.fn();
//     UnleashClientSpy.mockReturnValue({
//       getVariant: getVariantMock,
//       updateContext: updateContextMock,
//       start: startClientMock,
//       stop: stopClientMock,
//       isEnabled: isEnabledMock,
//       on: localMock,
//       off: offMock,
//     });
  
//     const client = new UnleashClient(givenConfig);
  
//     render(
//       <FlagProvider unleashClient={client}>
//         <div>Hi</div>
//       </FlagProvider>
//     );
  
//     localMock.mockImplementation((event, cb) => {
//       if (event === EVENTS.READY) {
//         cb();
//       }
//     });
  
//     expect(localMock).toHaveBeenCalledWith(EVENTS.READY, expect.any(Function));
//   });


  
//   test('should register error when error event is sent', () => {
//     const localMock = vi.fn();
//     UnleashClientSpy.mockReturnValue({
//       getVariant: getVariantMock,
//       updateContext: updateContextMock,
//       start: startClientMock,
//       stop: stopClientMock,
//       isEnabled: isEnabledMock,
//       on: localMock,
//       off: offMock,
//     });
  
//     const client = new UnleashClient(givenConfig);
  
//     render(
//       <FlagProvider unleashClient={client}>
//         <div>Hi</div>
//       </FlagProvider>
//     );
  
//     localMock.mockImplementation((event, cb) => {
//       if (event === EVENTS.ERROR) {
//         cb('Error');
//       }
//     });
  
//     expect(localMock).toHaveBeenCalledWith(EVENTS.ERROR, expect.any(Function));
//   });