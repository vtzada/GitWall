use std::sync::Mutex;
use windows::core::{s, BOOL};
use windows::Win32::Foundation::{HWND, LPARAM, RECT, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, FindWindowA, FindWindowExA, GetSystemMetrics, GetWindowLongPtrW, GetWindowRect,
    SendMessageTimeoutA, SetParent, SetWindowLongPtrW, SetWindowPos, ShowWindow, GWL_EXSTYLE,
    GWL_STYLE, SMTO_NORMAL, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN,
    SM_YVIRTUALSCREEN, SWP_FRAMECHANGED, SWP_NOACTIVATE, SWP_SHOWWINDOW, SW_HIDE, SW_SHOW,
    WS_BORDER, WS_CAPTION, WS_CHILD,
    WS_EX_APPWINDOW, WS_EX_CLIENTEDGE, WS_EX_NOACTIVATE, WS_EX_NOREDIRECTIONBITMAP,
    WS_EX_STATICEDGE, WS_EX_TOOLWINDOW, WS_EX_WINDOWEDGE, WS_MAXIMIZEBOX, WS_MINIMIZEBOX, WS_POPUP,
    WS_SYSMENU, WS_THICKFRAME,
};

#[derive(Clone, Copy)]
struct SavedState {
    style: isize,
    ex_style: isize,
    rect: RECT,
}

static ORIGINAL_STATE: Mutex<Option<SavedState>> = Mutex::new(None);

unsafe extern "system" fn enum_worker_w(window: HWND, lparam: LPARAM) -> BOOL {
    let shell = FindWindowExA(Some(window), None, s!("SHELLDLL_DefView"), None)
        .unwrap_or_default();

    if !HWND::is_invalid(&shell) {
        let worker = FindWindowExA(None, Some(window), s!("WorkerW"), None)
            .unwrap_or_default();
        if !HWND::is_invalid(&worker) {
            *(lparam.0 as *mut HWND) = worker;
            return false.into();
        }
    }
    true.into()
}

pub fn attach_to_desktop(hwnd: HWND) -> Result<(), String> {
    unsafe {
        // 1) Captura estado original.
        {
            let mut guard = ORIGINAL_STATE
                .lock()
                .map_err(|_| "state lock poisoned".to_string())?;
            if guard.is_none() {
                let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
                let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
                let mut rect = RECT::default();
                let _ = GetWindowRect(hwnd, &mut rect);
                *guard = Some(SavedState { style, ex_style, rect });
            }
        }

        // 2) Esconde + WS_EX_NOREDIRECTIONBITMAP.
        let _ = ShowWindow(hwnd, SW_HIDE);

        let progman = FindWindowA(s!("Progman"), None)
            .map_err(|e| format!("Progman not found: {e}"))?;

        let _ = SendMessageTimeoutA(
            progman,
            0x052C,
            WPARAM(0x0000000D),
            LPARAM(0x00000001),
            SMTO_NORMAL,
            1000,
            None,
        );

        let mut worker = HWND::default();
        let _ = EnumWindows(
            Some(enum_worker_w),
            LPARAM(&mut worker as *mut HWND as isize),
        );

        if HWND::is_invalid(&worker) {
            worker = FindWindowA(s!("WorkerW"), None).unwrap_or_default();
        }
        if HWND::is_invalid(&worker) {
            worker = progman;
        }

        // 3) Estilos NORMAIS — remove TUDO que desenha borda.
        let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
        let new_style = (style
            & !(WS_POPUP.0 as isize)
            & !(WS_CAPTION.0 as isize)
            & !(WS_THICKFRAME.0 as isize)
            & !(WS_BORDER.0 as isize)          // ← novo
            & !(WS_MINIMIZEBOX.0 as isize)
            & !(WS_MAXIMIZEBOX.0 as isize)
            & !(WS_SYSMENU.0 as isize))
            | WS_CHILD.0 as isize;
        SetWindowLongPtrW(hwnd, GWL_STYLE, new_style);

        // 4) Estilos ESTENDIDOS — remove TODAS as bordas 3D.
        let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let new_ex = (ex_style
            & !(WS_EX_APPWINDOW.0 as isize)
            & !(WS_EX_WINDOWEDGE.0 as isize)    // ← restaurado
            & !(WS_EX_CLIENTEDGE.0 as isize)    // ← restaurado
            & !(WS_EX_STATICEDGE.0 as isize))   // ← novo
            | WS_EX_TOOLWINDOW.0 as isize
            | WS_EX_NOACTIVATE.0 as isize
            | WS_EX_NOREDIRECTIONBITMAP.0 as isize;
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new_ex);

        // 5) Reparenta.
        SetParent(hwnd, Some(worker)).map_err(|e| format!("SetParent failed: {e}"))?;

        // 6) Usa as dimensões do VIRTUAL SCREEN com um leve overscan (12px)
        //    para empurrar a borda de 1px desenhada pelo DWM do Windows para fora da tela.
        const OVERSCAN: i32 = 12;
        let x = GetSystemMetrics(SM_XVIRTUALSCREEN) - OVERSCAN;
        let y = GetSystemMetrics(SM_YVIRTUALSCREEN) - OVERSCAN;
        let width = GetSystemMetrics(SM_CXVIRTUALSCREEN) + OVERSCAN * 2;
        let height = GetSystemMetrics(SM_CYVIRTUALSCREEN) + OVERSCAN * 2;

        SetWindowPos(
            hwnd,
            None,
            x,
            y,
            width,
            height,
            SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_FRAMECHANGED,
        )
        .map_err(|e| format!("SetWindowPos failed: {e}"))?;

        let _ = ShowWindow(hwnd, SW_SHOW);

        Ok(())
    }
}

pub fn detach_from_desktop(hwnd: HWND) -> Result<(), String> {
    unsafe {
        SetParent(hwnd, None).map_err(|e| format!("Detach failed: {e}"))?;

        let saved = *ORIGINAL_STATE
            .lock()
            .map_err(|_| "state lock poisoned".to_string())?
            .as_ref()
            .ok_or_else(|| "no saved state to restore".to_string())?;

        SetWindowLongPtrW(hwnd, GWL_STYLE, saved.style);
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, saved.ex_style);

        let width = saved.rect.right - saved.rect.left;
        let height = saved.rect.bottom - saved.rect.top;

        SetWindowPos(
            hwnd,
            None,
            saved.rect.left,
            saved.rect.top,
            width,
            height,
            SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_FRAMECHANGED,
        )
        .map_err(|e| format!("SetWindowPos (detach) failed: {e}"))?;

        let _ = ShowWindow(hwnd, SW_SHOW);

        if let Ok(mut guard) = ORIGINAL_STATE.lock() {
            *guard = None;
        }

        Ok(())
    }
}